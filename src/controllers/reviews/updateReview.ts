import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import review from "../../models/review";
import recalculateProductRating from "../../utils/recalculateProductRating";

const updateReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user, rating, comment } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "review id is not valid" });
  }

  if (!user || !isValidObjectId(user)) {
    return res.status(400).json({ message: "user is not valid or missing" });
  }

  if (
    rating !== undefined &&
    (typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5)
  ) {
    return res.status(400).json({ message: "rating must be an integer between 1 and 5" });
  }

  if (comment !== undefined && (typeof comment !== "string" || comment.length > 500)) {
    return res.status(400).json({ message: "comment must be a string of at most 500 characters" });
  }

  try {
    const reviewDoc = await review.findById(id);

    if (!reviewDoc) {
      return res.status(404).json({ message: "review not found" });
    }

    if (reviewDoc.user._id.toString() !== user) {
      return res.status(403).json({ message: "this review does not belong to the user" });
    }

    if (rating !== undefined) {
      reviewDoc.rating = rating;
    }

    if (comment !== undefined) {
      reviewDoc.comment = comment;
    }

    await reviewDoc.save();
    await recalculateProductRating(reviewDoc.product._id.toString());

    return res.status(200).json(reviewDoc);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export { updateReview };
