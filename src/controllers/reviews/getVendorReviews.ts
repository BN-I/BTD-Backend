import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import review from "../../models/review";

const getVendorReviews = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "vendor id is not valid" });
  }

  try {
    const reviews = await review
      .find({ vendor: id, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 });
    return res.status(200).json(reviews);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export { getVendorReviews };
