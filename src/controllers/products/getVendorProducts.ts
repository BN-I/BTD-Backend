import { Request, Response } from "express";
import Product from "../../models/product";
import { isValidObjectId } from "mongoose";

const getVendorProducts = async (req: Request, res: Response) => {
  const { page = 1, perPage = 10 } = req.query;
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Vendor ID is not valid",
    });
  }

  try {
    const products = await Product.find({
      vendor: id,
    })
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { getVendorProducts };
