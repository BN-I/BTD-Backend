import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import review from "../../models/review";
import User from "../../models/user";
import { sendEmail } from "../../utils/mailer";
import { starsDisplay } from "../../utils/helperFunctions";

const reportReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { vendorId, reason } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "review id is not valid" });
  }

  if (!vendorId || !isValidObjectId(vendorId)) {
    return res
      .status(400)
      .json({ message: "vendorId is not valid or missing" });
  }

  if (!reason || !reason.trim()) {
    return res
      .status(400)
      .json({ message: "A reason is required to report a review" });
  }

  try {
    const reviewDoc = await review.findById(id);

    if (!reviewDoc) {
      return res.status(404).json({ message: "review not found" });
    }

    if (reviewDoc.vendor.toString() !== vendorId) {
      return res
        .status(403)
        .json({ message: "this review does not belong to your products" });
    }

    if (reviewDoc.reportStatus === "pending") {
      return res.status(400).json({
        message: "This review has already been reported and is pending review",
      });
    }

    reviewDoc.reportStatus = "pending";
    reviewDoc.reportReason = reason.trim();
    reviewDoc.reportedAt = new Date();
    await reviewDoc.save();

    // Notify admins; don't fail the report if email delivery fails.
    (async () => {
      try {
        const vendorUser = await User.findById(vendorId);
        const admins = await User.find({ role: "Admin" });
        const productTitle = (reviewDoc.product as any)?.title ?? "a product";

        await Promise.all(
          admins
            .filter((admin: any) => admin.email)
            .map((admin: any) =>
              sendEmail({
                to: admin.email,
                subject: `Review Reported - ${productTitle}`,
                template: "reviewReported",
                variables: {
                  productTitle,
                  vendorName: vendorUser?.name || "A vendor",
                  reportReason: reviewDoc.reportReason || "",
                  starsDisplay: starsDisplay(reviewDoc.rating),
                  rating: reviewDoc.rating.toString(),
                  customerName: (reviewDoc.user as any)?.name || "A customer",
                  comment: reviewDoc.comment?.trim() || "No written comment",
                  dashboardUrl: process.env.ADMIN_URL
                    ? `${process.env.ADMIN_URL}/reviews`
                    : "#",
                },
              }),
            ),
        );
      } catch (emailErr) {
        console.error("Error sending review report email:", emailErr);
      }
    })();

    return res
      .status(200)
      .json({ message: "Review reported successfully", review: reviewDoc });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export { reportReview };
