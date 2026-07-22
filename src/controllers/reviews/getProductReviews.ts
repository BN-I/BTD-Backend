import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import review from "../../models/review";
import product from "../../models/product";

const getProductReviews = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "product id is not valid" });
  }

  try {
    const productDoc = await product.findById(id);

    if (!productDoc) {
      return res.status(404).json({ message: "product not found" });
    }

    const reviews = await review
      .find({ product: id, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.status(200).json({
      reviews,
      avgRating: productDoc.avgRating,
      weightedRating: productDoc.weightedRating,
      reviewCount: productDoc.reviewCount,
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export { getProductReviews };
