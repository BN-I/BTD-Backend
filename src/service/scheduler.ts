import e from "express";
import { sendEventNotification } from "./notification";
import Event from "../models/event";

const Queue = require("bull");
const notificationQueue = new Queue(
  "notificationQueue",
  `redis://${process.env.Redis_Host}:${process.env.Redis_Port}`
);

export function scheduleEvent(event: any) {
  // Store event in the database
  // Schedule a notification for the exact time the event is to occur
  notificationQueue.add(
    { eventId: event._id },
    { delay: calculateDelayUntilEvent(event.fullDate, event.time) } // Delay until the event's scheduled time
  );
}

// Worker that handles sending notifications
notificationQueue.process(async (job: any) => {
  const event = await Event.findById(job.data.eventId);
  // sendNotificationToUser(event.userId, event);
  sendEventNotification(event);
  console.log("here");
  console.log(job);
});

function calculateDelayUntilEvent(eventDate: any, eventTime: any) {
  const now = new Date();
  const eventDateTime = new Date(eventDate);
  eventDateTime.setHours(eventTime.getHours(), eventTime.getMinutes(), 0, 0);
  console.log("eventDateTime", eventDateTime);
  console.log("now", now);
  console.log(eventTime.getTime() - now.getTime());
  return eventTime.getTime() - now.getTime(); // Time difference in milliseconds
}
