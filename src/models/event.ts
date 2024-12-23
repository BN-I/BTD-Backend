import mongooseModel from "mongoose";

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
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
  },

  { timestamps: true }
);

Event.pre("find", function (this: mongooseModel.Model<any>) {
  this.populate("gifts", []);
});
Event.pre("findOne", function (this: mongooseModel.Model<any>) {
  this.populate("gifts", []);
});

export default mongoose.model("Event", Event);
