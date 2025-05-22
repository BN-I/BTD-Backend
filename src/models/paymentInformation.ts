const mongoose = require("mongoose");

const PaymentInformation = mongoose.Schema(
  {
    vendorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bankName: {
      type: String,
      default: "",
      required: true,
    },
    accountHolderFirstName: {
      type: String,
      default: "",
      required: true,
    },
    accountHolderLastName: {
      type: String,
      default: "",
      required: true,
    },
    businessUrl: {
      type: String,
      default: "",
      required: true,
    },
    accountNumber: {
      type: String,
      default: "",
      required: true,
    },
    routingNumber: {
      type: String,
      default: "",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PaymentInformation", PaymentInformation);
