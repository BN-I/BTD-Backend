import { Request, Response } from "express";
import Order from "../../models/order";
import User from "../../models/user";

const getAdminDashboardDetails = async (req: Request, res: Response) => {
  const allOrder = await Order.find();
  const allUsers = await User.find({ role: "User" });
  const allVendors = await User.find({ role: "Vendor" });

  res.status(200).json({
    allOrder,
    allUsers,
    allVendors,
  });
};

export default getAdminDashboardDetails;
