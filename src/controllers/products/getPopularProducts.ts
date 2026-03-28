import { Request, Response } from "express";
import Product from "../../models/product";

const getPopularProducts = async (req: Request, res: Response) => {
  const { page = 1, perPage = 10, eventDate } = req.query;
  const { source } = req.query;
  try {
    const filter: Record<string, any> = { isDeleted: false };

    if (source !== "admin" && source !== "vendor") {
      filter.status = "Active";
    }

    if (eventDate) {
      const remainingDays = Math.ceil(
        (new Date(eventDate as string).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      );

      console.log(remainingDays);
      filter.orderMinDays = { $lt: remainingDays };
    }

    const products = await Product.find(filter)
      .populate("storeInfo", "storeName")
      .sort({ orders: -1 })
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { getPopularProducts };
