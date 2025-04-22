//write a controller to delete product

import { Request, Response } from "express";
import Product from "../../models/product";
import { isValidObjectId } from "mongoose";

const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Product ID is not valid",
    });
  }

  try {
    const product = await Product.findOneAndUpdate(
      { _id: id },
      { isDeleted: true },
      {
        new: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { deleteProduct };
