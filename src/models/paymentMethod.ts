import user from "./user";

const mongoose = require("mongoose");

const PaymentMethod = mongoose.Schema({
  holderName: {
    type: String,
    default: "",
    required: true,
  },
  cardNumber: {
    type: String,
    default: "",
    required: true,
  },
  expiryMonth: {
    type: String,
    default: "",
    required: true,
  },
  expiryYear: {
    type: String,
    default: "",
    required: true,
  },
  cvv: {
    type: String,
    default: "",
    required: true,
  },
  postalCode: {
    type: String,
    default: "",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default mongoose.model("PaymentMethod", PaymentMethod);
