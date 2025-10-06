import { Request, Response } from "express";
import Event from "../../models/event";

const getPastEvents = async (req: Request, res: Response) => {
  const { page = 1, perPage = 10 } = req.query;
  const { id } = req.params;

  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getUTCDate() - 30); // Get the date 30 days ago
  // Get the month and year for today and 30 days ago for comparison purposes
  const currentMonth = today.getUTCMonth() + 1; // Get current month (1-12)
  const currentDay = today.getUTCDate(); // Get today's date (1-31)
  const thirtyDaysAgoMonth = thirtyDaysAgo.getUTCMonth() + 1; // Get the month for 30 days ago
  const thirtyDaysAgoYear = thirtyDaysAgo.getUTCFullYear(); // Get the year for 30 days ago

  console.log(currentDay, "currentDay");
  console.log(currentMonth, "currentMonth");
  console.log(today.getUTCFullYear(), "today.getUTCFullYear()");

  try {
    // Find events that are in the upcoming month or current month, ignoring year
    const events = await Event.find({
      $or: [
        {
          month: thirtyDaysAgoMonth,
          date: { $gte: thirtyDaysAgo.getUTCDate() },
          year: thirtyDaysAgoYear,
        },
        {
          month: thirtyDaysAgoMonth,
          date: { $gte: thirtyDaysAgo.getUTCDate() },
          recurringEvent: true,
        },

        {
          month: currentMonth,
          date: { $lte: currentDay },
          year: today.getUTCFullYear(),
        },
        {
          month: currentMonth,
          date: { $lte: currentDay },
          recurringEvent: true,
        },
      ],

      user: id,
    })
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));

    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { getPastEvents };
