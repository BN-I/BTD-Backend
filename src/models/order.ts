import mongooseModel from "mongoose";
const mongoose = require("mongoose");

const Order = mongoose.Schema(
  {
    gifts: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        selectedVariations: {
          color: {
            type: String,
            required: false,
          },
          size: {
            type: String,
            required: false,
          },
        },
        price: {
          type: Number,
          required: false,
        },
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: false,
        },
      },
    ],
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
      required: true,
    },
    totalAmount: {
      type: Number,
      default: 0,
      required: true,
    },
    status: {
      type: String,
      default: "paid",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    amountDispatched: {
      type: Boolean,
      default: false,
    },
    shippingService: {
      type: String,
      default: "selfDelivery",
      required: false,
    },
    trackingID: {
      type: String,
      default: "",
      required: false,
    },
    trackingURL: {
      type: String,
      default: "",
      required: false,
    },
  },
  { timestamps: true }
);

Order.pre("find", function (this: mongooseModel.Model<any>) {
  this.populate("event", []);
  this.populate("gifts.product", []);
  this.populate("user", []);
  this.populate("vendor", []);
});
Order.pre("findOne", function (this: mongooseModel.Model<any>) {
  this.populate("event", []);
  this.populate("gifts.product", []);
  this.populate("user", []);
  this.populate("vendor", []);
});

Order.pre("findById", function (this: mongooseModel.Model<any>) {
  this.populate("event", []);
  this.populate("gifts.product", []);
  this.populate("user", []);
  this.populate("vendor", []);
});

export default mongoose.model("Order", Order);
