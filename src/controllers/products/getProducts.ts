//write a controller to get products from the database with pagination and sorting

import { Request, Response } from "express";
import Product from "../../models/product";

const getProducts = async (req: Request, res: Response) => {
  const { page = 1, perPage = 10 } = req.query;
  try {
    const products = await Product.find()
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { getProducts };