import { link } from "fs";
import { ProductStatus } from "../types/types";
import mongooseModel from "mongoose";
const mongoose = require("mongoose");

const Product = mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      required: true,
    },
    description: {
      type: String,
      default: "",
      required: false,
    },
    category: {
      type: String,
      default: "other",
      required: false,
    },
    price: {
      type: Number,
      default: 0,
      required: true,
    },
    discountedPrice: {
      type: Number,
      default: null,
      required: false,
    },
    images: {
      type: Array<string>,
      default: "",
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      required: false,
    },
    colorVariations: {
      type: Array<string>,
      default: [],
      required: false,
    },
    sizeVariations: {
      type: Array<string>,
      default: [],
      required: false,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      default: "Inactive",
      enum: ProductStatus,
      required: false,
    },
    link: {
      type: String,
      default: "",
      required: false,
    },
    orders: {
      type: Number,
      default: 0,
    },
    orderMinDays: {
      type: Number,
      default: 0,
    },
    orderMaxDays: {
      type: Number,
      default: 365,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  { timestamps: true }
);

Product.pre("find", function (this: mongooseModel.Model<any>) {
  this.populate("vendor", []);
});
Product.pre("findOne", function (this: mongooseModel.Model<any>) {
  this.populate("vendor", []);
});

export default mongoose.model("Product", Product);
