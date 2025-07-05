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

export async function updateScheduledEvent(event: any) {
  // Remove the existing job
  const jobs = await notificationQueue.getDelayed();
  console.log("jobs", jobs);
  const existingJob = jobs.find((j: any) => {
    console.log("event._id", event._id.toString());
    console.log("j.data.eventId", j.data.eventId);
    return j.data.eventId.toString() === event._id.toString();
  });
  console.log("existingJob", existingJob);
  if (existingJob) {
    await existingJob.remove();
  }
  // Store event in the database
  // Schedule a notification for the exact time the event is to occur
  await notificationQueue.add(
    { eventId: event._id },
    { delay: calculateDelayUntilEvent(event.fullDate, event.time) }
  );
}

export async function deleteScheduledEvent(event: any) {
  // Remove the existing job
  const jobs = await notificationQueue.getDelayed();
  console.log("jobs", jobs);
  const existingJob = jobs.find((j: any) => {
    console.log("event._id", event._id.toString());
    console.log("j.data.eventId", j.data.eventId);
    return j.data.eventId.toString() === event._id.toString();
  });
  console.log("existingJob", existingJob);
  if (existingJob) {
    await existingJob.remove();
  }
}

// Worker that handles sending notifications
notificationQueue.process(async (job: any) => {
  const event = await Event.findById(job.data.eventId);
  // sendNotificationToUser(event.userId, event);
  if (!event) return;
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
