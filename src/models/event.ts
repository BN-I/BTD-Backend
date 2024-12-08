const mongoose = require("mongoose");
const Event = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
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
    },
    gifts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    ],
  },

  { timestamps: true }
);

export default mongoose.model("Event", Event);
