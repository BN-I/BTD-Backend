import { Request, Response } from "express";
import Event from "../../models/event";
import user from "../../models/user";

const getUpcomingEvents = async (req: Request, res: Response) => {
  const { page = 1, perPage = 10 } = req.query;
  const { id } = req.params;

  const today = new Date();
  const currentMonth = today.getUTCMonth() + 1; // Get current month (1-12)
  const currentDay = today.getUTCDate(); // Get today's date (1-31)
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getUTCMonth() + 1); // Get the next month
  const nextMonthNumber = nextMonth.getUTCMonth() + 1; // Get the next month number (1-12)

  console.log(currentMonth, currentDay, nextMonthNumber);

  var conditions: Array<any> = [
    {
      month: currentMonth,
      date: { $gt: currentDay },
    },
    //event fulldate - today should be under 30 and over 0
    {
      month: { $gt: currentMonth, $lt: nextMonth },
      date: { $gt: currentDay },
      year: { $gte: today.getUTCFullYear() },
    },
  ];

  if (nextMonthNumber == 1) {
    // Events in the next month
    conditions.push({
      month: nextMonthNumber,
      recurringEvent: true,
    });
  } else {
    conditions.push({
      month: nextMonthNumber,
    });
  }

  try {
    // Find events that are in the upcoming month or current month, ignoring year
    const events = await Event.find({
      $or: conditions,
      user: id,
    })
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));

    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { getUpcomingEvents };
