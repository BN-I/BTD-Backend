const Queue = require("bull");
const notificationQueue = new Queue(
  "notificationQueue",
  "redis://127.0.0.1:6379"
);

function scheduleEvent(event: any) {
  // Store event in the database
  // Schedule a notification for the exact time the event is to occur
  notificationQueue.add(
    { eventId: event.id },
    { delay: calculateDelayUntilEvent(event.dateTime) } // Delay until the event's scheduled time
  );
}

console.log(new Date());

// Worker that handles sending notifications
notificationQueue.process(async (job: any) => {
  // const event = await getEventById(job.data.eventId);
  // sendNotificationToUser(event.userId, event);
  console.log("here");
  console.log(job);
});

function calculateDelayUntilEvent(eventDateTime: any) {
  const now = new Date();
  const eventTime = new Date(eventDateTime);
  console.log(eventTime.getTime() - now.getTime());
  return eventTime.getTime() - now.getTime(); // Time difference in milliseconds
}
