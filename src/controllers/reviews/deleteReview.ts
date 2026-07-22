import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import review from "../../models/review";
import recalculateProductRating from "../../utils/recalculateProductRating";

const deleteReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "review id is not valid" });
  }

  if (!user || !isValidObjectId(user)) {
    return res.status(400).json({ message: "user is not valid or missing" });
  }

  try {
    const reviewDoc = await review.findById(id);

    if (!reviewDoc) {
      return res.status(404).json({ message: "review not found" });
    }

    if (reviewDoc.user._id.toString() !== user) {
      return res.status(403).json({ message: "this review does not belong to the user" });
    }

    const productId = reviewDoc.product._id.toString();

    await review.findByIdAndDelete(id);
    await recalculateProductRating(productId);

    return res.status(200).json({ message: "review deleted" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export { deleteReview };
