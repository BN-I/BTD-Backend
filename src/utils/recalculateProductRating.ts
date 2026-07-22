const mongoose = require("mongoose");
import Review from "../models/review";
import Product from "../models/product";

// Bayesian-weighted rating (IMDb-style) so a product with very few reviews
// isn't dragged to an extreme by a single outlier review. Confidence constant
// (C) and prior (PRIOR_RATING) were chosen for a new platform where most
// products will sit at a low review count for a while.
const CONFIDENCE_CONSTANT = 10;
const PRIOR_RATING = 5;

const recalculateProductRating = async (productId: string) => {
  const [stats] = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isDeleted: { $ne: true },
      },
    },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const avgRating = stats?.avgRating ?? 0;
  const reviewCount = stats?.reviewCount ?? 0;
  const weightedRating =
    (CONFIDENCE_CONSTANT * PRIOR_RATING + reviewCount * avgRating) /
    (CONFIDENCE_CONSTANT + reviewCount);

  await Product.findByIdAndUpdate(productId, {
    avgRating,
    reviewCount,
    weightedRating,
  });
};

export default recalculateProductRating;
