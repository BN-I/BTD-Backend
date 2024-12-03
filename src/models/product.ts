import { ProductStatus } from "../types/types";

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
  },
  { timestamps: true }
);

export default mongoose.model("Product", Product);
