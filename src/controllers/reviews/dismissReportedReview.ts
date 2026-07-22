import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import review from "../../models/review";
import { notifyVendorReviewStatus } from "../../utils/notifyVendorReviewStatus";

// Admin decided the reported review doesn't need action: the review stays
// up, the report is just marked closed so it drops out of the queue.
const dismissReportedReview = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "review id is not valid" });
  }

  try {
    const reviewDoc = await review.findById(id);

    if (!reviewDoc) {
      return res.status(404).json({ message: "review not found" });
    }

    reviewDoc.reportStatus = "dismissed";
    await reviewDoc.save();

    notifyVendorReviewStatus(reviewDoc, "dismissed");

    return res.status(200).json({ message: "report dismissed" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export { dismissReportedReview };
