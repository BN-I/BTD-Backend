const mongoose = require("mongoose");

const User = mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      required: true,
    },
    email: {
      type: String,
      default: "",
      required: true,
    },
    password: {
      type: String,
      default: "",
      required: false,
    },
    token: {
      type: String,
      default: "",
      required: false,
    },
    loginProvider: {
      type: String,
      default: "",
      required: true,
    },
    role: {
      type: String,
      default: "",
      required: true,
    },
    streetAddress: {
      type: String,
      default: "",
      required: false,
    },
    apartmentNumber: {
      type: String,
      default: "",
      required: false,
    },
    city: {
      type: String,
      default: "",
      required: false,
    },
    state: {
      type: String,
      default: "",
      required: false,
    },
    postalCode: {
      type: String,
      default: "",
      required: false,
    },
    country: {
      type: String,
      default: "",
      required: false,
    },
    phoneNumber: {
      type: String,
      default: "",
      required: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
      required: false,
    },
    stripeCustomerId: {
      type: String,
      default: "",
      required: false,
    },
    FCMToken: {
      type: String,
      default: "",
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", User);
