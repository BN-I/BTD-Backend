import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import review from "../../models/review";
import order from "../../models/order";
import User from "../../models/user";
import { OrderStatus } from "../../types/types";
import recalculateProductRating from "../../utils/recalculateProductRating";
import { sendEmail } from "../../utils/mailer";
import { starsDisplay } from "../../utils/helperFunctions";

const postReview = async (req: Request, res: Response) => {
  const { order: orderId, product: productId, user, rating, comment } = req.body;

  if (!orderId || !isValidObjectId(orderId)) {
    return res.status(400).json({ message: "order is not valid or missing" });
  }

  if (!productId || !isValidObjectId(productId)) {
    return res.status(400).json({ message: "product is not valid or missing" });
  }

  if (!user || !isValidObjectId(user)) {
    return res.status(400).json({ message: "user is not valid or missing" });
  }

  if (
    rating === undefined ||
    rating === null ||
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return res.status(400).json({ message: "rating must be an integer between 1 and 5" });
  }

  if (comment !== undefined && (typeof comment !== "string" || comment.length > 500)) {
    return res.status(400).json({ message: "comment must be a string of at most 500 characters" });
  }

  try {
    const orderDoc = await order.findById(orderId);

    if (!orderDoc) {
      return res.status(404).json({ message: "order not found" });
    }

    if (orderDoc.user._id.toString() !== user) {
      return res.status(403).json({ message: "this order does not belong to the user" });
    }

    if (orderDoc.status !== OrderStatus.delivered) {
      return res.status(400).json({ message: "only delivered orders can be reviewed" });
    }

    const gift = orderDoc.gifts.find(
      (g: any) => g.product._id.toString() === productId
    );

    if (!gift) {
      return res.status(400).json({ message: "product was not part of this order" });
    }

    const existingReview = await review.findOne({ order: orderId, product: productId });

    if (existingReview) {
      return res.status(409).json({ message: "this product has already been reviewed for this order" });
    }

    const reviewObject = await review.create({
      order: orderId,
      product: productId,
      user,
      vendor: gift.vendor?._id ?? gift.vendor ?? orderDoc.vendor._id,
      rating,
      comment: comment ?? "",
    });

    await recalculateProductRating(productId);

    // Notify the vendor and admins; don't fail review creation if email
    // delivery fails.
    (async () => {
      try {
        const vendorId = reviewObject.vendor.toString();
        const vendorUser = await User.findById(vendorId);
        const admins = await User.find({ role: "Admin" });

        const productTitle = gift.product?.title ?? "your product";
        const customerName = orderDoc.user?.name ?? "A customer";
        const commentText = comment?.trim() || "No written comment";
        const variables = {
          productTitle,
          vendorName: vendorUser?.name || "Vendor",
          starsDisplay: starsDisplay(rating),
          rating: rating.toString(),
          customerName,
          comment: commentText,
        };

        if (vendorUser?.email) {
          await sendEmail({
            to: vendorUser.email,
            subject: `New Review on ${productTitle}`,
            template: "productReviewedVendor",
            variables: {
              ...variables,
              dashboardUrl: process.env.DASHBOARD_URL
                ? `${process.env.DASHBOARD_URL}/reviews`
                : "#",
            },
          });
        }

        await Promise.all(
          admins
            .filter((admin: any) => admin.email)
            .map((admin: any) =>
              sendEmail({
                to: admin.email,
                subject: `New Review Submitted - ${productTitle}`,
                template: "productReviewedAdmin",
                variables: {
                  ...variables,
                  dashboardUrl: process.env.ADMIN_URL
                    ? `${process.env.ADMIN_URL}/products`
                    : "#",
                },
              }),
            ),
        );
      } catch (emailErr) {
        console.error("Error sending review notification emails:", emailErr);
      }
    })();

    return res.status(201).json(reviewObject);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export { postReview };
