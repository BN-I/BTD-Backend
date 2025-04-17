import mongooseModel from "mongoose";
const mongoose = require("mongoose");

const BusinessInformation = mongoose.Schema(
  {
    vendorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessType: {
      type: String,
      default: "",
      required: true,
    },
    taxID: {
      type: String,
      default: "",
      required: true,
    },
    businessEmail: {
      type: String,
      default: "",
      required: true,
    },
    businessPhone: {
      type: String,
      default: "",
      required: true,
    },
    businessAddress: {
      type: String,
      default: "",
      required: true,
    },
    city: {
      type: String,
      default: "",
      required: true,
    },
    state: {
      type: String,
      default: "",
      required: true,
    },
    postalCode: {
      type: String,
      default: "",
      required: true,
    },
    country: {
      type: String,
      default: "",
      required: true,
    },
    storePolicy: {
      type: String,
      default: "",
      required: true,
    },
    returnPolicy: {
      type: String,
      default: "",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("BusinessInformation", BusinessInformation);
