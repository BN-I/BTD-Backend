import { Request, Response } from "express";
import Event from "../../models/event";

const getUpcomingEvents = async (req: Request, res: Response) => {
  const { page = 1, perPage = 10 } = req.query;

  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1); // Move to next month

  const currentMonth = today.getMonth(); // Current month
  const currentDay = today.getDate(); // Current day
  const nextMonthDate = nextMonth.getDate(); // Date for next month

  try {
    // Find events that are in the upcoming month or current month, ignoring year
    const events = await Event.find({
      // Compare the month and day (ignoring year)
      $expr: {
        $or: [
          // Events within the current month
          {
            $and: [
              { $eq: [{ $month: "$date" }, currentMonth] }, // Match current month
              { $gte: [{ $dayOfMonth: "$date" }, currentDay] }, // Events that are after today
            ],
          },
          // Events within the next month (can cross the year boundary)
          {
            $and: [
              { $eq: [{ $month: "$date" }, (currentMonth + 1) % 12] }, // Match next month, wrap around if December
              { $gte: [{ $dayOfMonth: "$date" }, 1] }, // Events from the start of next month onward
              { $lte: [{ $dayOfMonth: "$date" }, nextMonthDate] }, // Events before or on the next month's date
            ],
          },
        ],
      },
    })
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));

    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { getUpcomingEvents };
