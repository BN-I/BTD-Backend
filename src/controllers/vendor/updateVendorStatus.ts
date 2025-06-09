import { Request, Response } from "express";
import User from "../../models/user";
import { UserStatus } from "../../types/types";

const updateVendorStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const vendor = await User.findById(id);

  if (!vendor) {
    return res.status(404).json({ message: "Vendor not found" });
  }

  console.log(status);
  console.log(Object.values(UserStatus).indexOf(status));

  if (Object.values(UserStatus).indexOf(status) === -1) {
    return res.status(400).json({ message: "Invalid status" });
  }

  vendor.status = status;
  try {
    await vendor.save();
    res.status(200).json({ message: "Vendor status updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export default updateVendorStatus;
