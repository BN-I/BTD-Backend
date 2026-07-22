import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import review from "../../models/review";

const getOrderReviews = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "order id is not valid" });
  }

  try {
    const reviews = await review.find({
      order: id,
      isDeleted: { $ne: true },
    });
    return res.status(200).json(reviews);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export { getOrderReviews };
