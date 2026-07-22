import mongooseModel from "mongoose";
const mongoose = require("mongoose");

const Review = mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      required: false,
      maxlength: 500,
    },
    reportStatus: {
      type: String,
      enum: ["none", "pending", "resolved", "dismissed"],
      default: "none",
    },
    reportReason: {
      type: String,
      required: false,
      maxlength: 1000,
    },
    reportedAt: {
      type: Date,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

Review.index({ order: 1, product: 1 }, { unique: true });

Review.pre("find", function (this: mongooseModel.Model<any>) {
  this.populate("user", "name");
  this.populate("product", "title images");
});
Review.pre("findOne", function (this: mongooseModel.Model<any>) {
  this.populate("user", "name");
  this.populate("product", "title images");
});

export default mongoose.model("Review", Review);
