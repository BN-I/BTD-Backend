import { Request, Response } from "express";
import event from "../models/event";

const eventsRouter = require("express").Router();
const { postEvent } = require("../controllers/events/postEvent");
const { updateEvent } = require("../controllers/events/updateEvent");
const { deleteEvent } = require("../controllers/events/deleteEvent");
const { getEvents } = require("../controllers/events/getEvents");
const { getUpcomingEvents } = require("../controllers/events/upcomingEvent");

eventsRouter.get("/api/event", async (req: Request, res: Response) => {
  getEvents(req, res);
});

eventsRouter.get("/api/event/upcoming", async (req: Request, res: Response) => {
  getUpcomingEvents(req, res);
});

eventsRouter.post("/api/event", async (req: Request, res: Response) => {
  postEvent(req, res);
});

eventsRouter.put("/api/event/:id", async (req: Request, res: Response) => {
  updateEvent(req, res);
});

eventsRouter.delete("/api/event/:id", async (req: Request, res: Response) => {
  deleteEvent(req, res);
});

module.exports = eventsRouter;
