import { Request, Response } from "express";
import User from "../../models/user";

const getVendors = async (req: Request, res: Response) => {
  try {
    const Vendors = await User.find({ role: "Vendor" });
    res.status(200).json(Vendors);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e });
  }
};

export default getVendors;
