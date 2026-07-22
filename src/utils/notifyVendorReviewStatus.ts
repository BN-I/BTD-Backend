import User from "../models/user";
import { sendEmail } from "./mailer";
import { starsDisplay } from "./helperFunctions";

type ReviewStatusAction = "dismissed" | "resolved";

const STATUS_CONTENT: Record<
  ReviewStatusAction,
  { label: string; style: string; message: string }
> = {
  dismissed: {
    label: "Report Dismissed",
    style: "background-color:#eef2f7;color:#374151;",
    message:
      "After review, we've decided the review will remain visible. Thank you for reporting it — we take all reports seriously.",
  },
  resolved: {
    label: "Review Removed",
    style: "background-color:#e8f5e9;color:#2e7d32;",
    message:
      "After review, we've removed this review from your product page. It no longer affects your product's rating.",
  },
};

// Notifies the vendor who filed a review report of the admin's decision.
// Swallows its own errors so a failed email never fails the caller's action.
export const notifyVendorReviewStatus = async (
  reviewDoc: any,
  action: ReviewStatusAction,
) => {
  try {
    const vendorUser = await User.findById(reviewDoc.vendor);
    if (!vendorUser?.email) return;

    const content = STATUS_CONTENT[action];
    const productTitle = reviewDoc.product?.title ?? "your product";

    await sendEmail({
      to: vendorUser.email,
      subject: `Update on Your Reported Review - ${productTitle}`,
      template: "reviewStatusUpdated",
      variables: {
        vendorName: vendorUser.name || "Vendor",
        productTitle,
        statusLabel: content.label,
        statusBadgeStyle: content.style,
        statusMessage: content.message,
        starsDisplay: starsDisplay(reviewDoc.rating),
        rating: reviewDoc.rating.toString(),
        customerName: reviewDoc.user?.name || "A customer",
        comment: reviewDoc.comment?.trim() || "No written comment",
        dashboardUrl: process.env.DASHBOARD_URL
          ? `${process.env.DASHBOARD_URL}/reviews`
          : "#",
      },
    });
  } catch (err) {
    console.error("Error sending review status update email:", err);
  }
};
