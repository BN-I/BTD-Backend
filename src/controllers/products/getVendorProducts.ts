import { Request, Response } from "express";
import Product from "../../models/product";
import { isValidObjectId } from "mongoose";

const getVendorProducts = async (req: Request, res: Response) => {
  const { page = 1, perPage = 10, search } = req.query;
  const { source } = req.query;
  const { id } = req.params;
  const filter: Record<string, any> = { isDeleted: false };
  if (source !== "admin" && source !== "vendor") {
    filter.status = "Active";
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  if (id) {
    filter.vendor = id;
  }

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Vendor ID is not valid",
    });
  }

  try {
    const products = await Product.find(filter)
      .populate("storeInfo", "storeName")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { getVendorProducts };
