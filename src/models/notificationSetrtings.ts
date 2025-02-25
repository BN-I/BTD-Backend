import mongooseModel from "mongoose";
import user from "./user";
const mongoose = require("mongoose");

const NotificationSettings = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
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
    events: {
      type: Boolean,
      default: false,
    },
    chat: {
      type: Boolean,
      default: false,
    },
    recommendations: {
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
    events: {
      type: Boolean,
      default: false,
    },
    chat: {
      type: Boolean,
      default: false,
    },
    recommendations: {
      type: Boolean,
      default: false,
    },
  },
  textMessages: {
    promotion: {
      type: Boolean,
      default: false,
    },
    reminder: {
      type: Boolean,
      default: false,
    },
    events: {
      type: Boolean,
      default: false,
    },
    chat: {
      type: Boolean,
      default: false,
    },
    recommendations: {
      type: Boolean,
      default: false,
    },
  },
});

export default mongoose.model("NotificationSettings", NotificationSettings);
