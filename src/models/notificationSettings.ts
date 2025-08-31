import mongooseModel from "mongoose";
import user from "./user";
const mongoose = require("mongoose");

const NotificationSettings = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  pushNotification: {
    promotion: {
      type: Boolean,
      default: true,
    },
    reminder: {
      type: Boolean,
      default: true,
    },
    event: {
      type: Boolean,
      default: true,
    },
    chat: {
      type: Boolean,
      default: true,
    },
    recommendation: {
      type: Boolean,
      default: true,
    },
  },
  emailNotification: {
    promotion: {
      type: Boolean,
      default: true,
    },
    reminder: {
      type: Boolean,
      default: true,
    },
    event: {
      type: Boolean,
      default: true,
    },
    chat: {
      type: Boolean,
      default: true,
    },
    recommendation: {
      type: Boolean,
      default: true,
    },
  },
  textNotification: {
    promotion: {
      type: Boolean,
      default: true,
    },
    reminder: {
      type: Boolean,
      default: true,
    },
    event: {
      type: Boolean,
      default: true,
    },
    chat: {
      type: Boolean,
      default: true,
    },
    recommendation: {
      type: Boolean,
      default: true,
    },
  },
});

export default mongoose.model("NotificationSettings", NotificationSettings);
