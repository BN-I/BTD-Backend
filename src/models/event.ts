import mongooseModel from "mongoose";
import product from "./product";
import { OrderedProduct, selectedProduct } from "../types/types";

const mongoose = require("mongoose");
const Event = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    fullDate: {
      type: Date,
      required: true,
    },
    date: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    time: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      required: false,
    },
    recipientPhone: {
      type: String,
      required: false,
    },
    recurringEvent: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
      },
    ],
  },

  { timestamps: true }
);

Event.pre("find", function (this: mongooseModel.Model<any>) {
  // Populate the gifts.product during the query execution
  this.populate("gifts.product", []);
});

// Event.post("find", function (events: any[]) {
//   // After the find query is executed, filter out gifts with null or undefined product
//   events.forEach((event) => {
//     event.gifts = event.gifts.filter(
//       (gift: { product: any }) => gift.product != null
//     );
//   });
// });

Event.pre("findOne", function (this: mongooseModel.Model<any>) {
  // Populate the gifts.product during the query execution
  this.populate("gifts.product", []);
});

// Event.post("findOne", function (events: any[]) {
//   // After the find query is executed, filter out gifts with null or undefined product
//   events.forEach((event) => {
//     event.gifts = event.gifts.filter(
//       (gift: { product: any }) => gift.product != null
//     );
//   });
// });

export default mongoose.model("Event", Event);
