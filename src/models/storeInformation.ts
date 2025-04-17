import mongooseModel from "mongoose";
const mongoose = require("mongoose");

const StoreInformation = mongoose.Schema(
  {
    vendorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    storeImage: {
      type: String,
      default: "",
      required: false,
    },
    storeName: {
      type: String,
      default: "",
      required: true,
    },
    storeDescription: {
      type: String,
      default: "",
      required: true,
    },
    businessCategory: {
      type: String,
      default: "",
      required: true,
    },
    companySize: {
      type: String,
      default: "",
      required: true,
    },
    yearFounded: {
      type: String,
      default: "",
      required: true,
    },
    website: {
      type: String,
      default: "",
      required: true,
    },
    instagram: {
      type: String,
      default: "",
      required: true,
    },
    facebook: {
      type: String,
      default: "",
      required: true,
    },
    twitter: {
      type: String,
      default: "",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("StoreInformation", StoreInformation);
