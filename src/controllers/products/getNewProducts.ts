import { Request, Response } from "express";
import Product from "../../models/product";

const getNewProducts = async (req: Request, res: Response) => {
  const { page = 1, perPage = 10 } = req.query;
  try {
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { getNewProducts };
