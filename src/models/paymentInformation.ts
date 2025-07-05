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

    phoneNumber: {
      type: String,
      default: "",
    },
    addressP: {
      type: String,
      default: "",
    },
    cityP: {
      type: String,
      default: "",
    },
    stateP: {
      type: String,
      default: "",
    },
    postalCodeP: {
      type: String,
      default: "",
    },
    countryP: {
      type: String,
      default: "",
    },
    id_number: {
      type: String,
      default: "",
    },
    dobDay: {
      type: Number,
      default: null,
    },
    dobMonth: {
      type: Number,
      default: null,
    },
    dobYear: {
      type: Number,
      default: null,
    },
    industry: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PaymentInformation", PaymentInformation);
