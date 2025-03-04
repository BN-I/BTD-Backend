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
      default: false,
    },
    reminder: {
      type: Boolean,
      default: false,
    },
    event: {
      type: Boolean,
      default: false,
    },
    chat: {
      type: Boolean,
      default: false,
    },
    recommendation: {
      type: Boolean,
      default: false,
    },
  },
  emailNotification: {
    promotion: {
      type: Boolean,
      default: false,
    },
    reminder: {
      type: Boolean,
      default: false,
    },
    event: {
      type: Boolean,
      default: false,
    },
    chat: {
      type: Boolean,
      default: false,
    },
    recommendation: {
      type: Boolean,
      default: false,
    },
  },
  textNotification: {
    promotion: {
      type: Boolean,
      default: false,
    },
    reminder: {
      type: Boolean,
      default: false,
    },
    event: {
      type: Boolean,
      default: false,
    },
    chat: {
      type: Boolean,
      default: false,
    },
    recommendation: {
      type: Boolean,
      default: false,
    },
  },
});

export default mongoose.model("NotificationSettings", NotificationSettings);
