import { Request, Response } from "express";
import review from "../../models/review";

// Queue of vendor-reported reviews awaiting an admin decision.
const getReportedReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await review
      .find({ reportStatus: "pending" })
      .populate("vendor", "name")
      .sort({ reportedAt: -1 });

    return res.status(200).json(reviews);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export { getReportedReviews };
