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
      required: false,
    },
    yearFounded: {
      type: String,
      default: "",
      required: false,
    },
    website: {
      type: String,
      default: "",
      required: false,
    },
    instagram: {
      type: String,
      default: "",
      required: false,
    },
    facebook: {
      type: String,
      default: "",
      required: false,
    },
    twitter: {
      type: String,
      default: "",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("StoreInformation", StoreInformation);
