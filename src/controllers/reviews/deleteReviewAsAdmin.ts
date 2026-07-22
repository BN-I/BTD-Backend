import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import review from "../../models/review";
import recalculateProductRating from "../../utils/recalculateProductRating";
import { notifyVendorReviewStatus } from "../../utils/notifyVendorReviewStatus";

// Unlike deleteReview (customer-facing, ownership-checked), this lets an
// admin remove any review regardless of who authored it. This is a soft
// delete only: the review is kept for audit purposes (isDeleted: true) but
// excluded from every read endpoint and from rating recalculation, so it
// has no visible effect on the product's rating.
const deleteReviewAsAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "review id is not valid" });
  }

  try {
    const reviewDoc = await review.findById(id);

    if (!reviewDoc) {
      return res.status(404).json({ message: "review not found" });
    }

    const productId = reviewDoc.product._id.toString();

    const wasReported = reviewDoc.reportStatus === "pending";

    reviewDoc.isDeleted = true;
    // A deleted review has nothing left to act on, so any open report is
    // considered resolved by this action.
    if (wasReported) {
      reviewDoc.reportStatus = "resolved";
    }
    await reviewDoc.save();
    await recalculateProductRating(productId);

    // Only the vendor who filed a report is expecting a follow-up; an
    // ad-hoc deletion of a never-reported review has no report to close.
    if (wasReported) {
      notifyVendorReviewStatus(reviewDoc, "resolved");
    }

    return res.status(200).json({ message: "review deleted" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export { deleteReviewAsAdmin };
