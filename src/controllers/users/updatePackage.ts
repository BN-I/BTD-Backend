import { Request, Response } from "express";
import { PackageType } from "../../types/types";
import User from "../../models/user";
import mongoose from "mongoose";

const updatePackage = async (req: Request, res: Response) => {
  const { amount, packageType, duration } = req.body as {
    amount: number;
    packageType: PackageType;
    user: string;
    duration: "Monthly" | "Yearly";
  };

  const { id } = req.params;

  console.log("req.body", req.body);
  console.log("req.params", req.params);

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  if (!packageType || !Object.values(PackageType).includes(packageType)) {
    return res.status(400).json({ message: "Invalid package type" });
  }

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (!duration || !["Monthly", "Yearly"].includes(duration)) {
    return res.status(400).json({ message: "Invalid duration" });
  }

  try {
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let newExpiryDate: Date;
    const today = new Date();

    // Check if user already has an active package
    if (
      existingUser.activePackage === packageType &&
      existingUser.packageExpiryDate
    ) {
      // Extend expiry if same package is being renewed
      newExpiryDate = new Date(existingUser.packageExpiryDate);
    } else {
      // Start fresh if it's a new package
      newExpiryDate = today;
    }

    // Update expiry based on duration
    if (duration === "Monthly") {
      newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
    } else if (duration === "Yearly") {
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
    } else {
      return res.status(400).json({ message: "Invalid duration" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        activePackage: packageType,
        packageExpiryDate: newExpiryDate,
      },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Package updated successfully", user: updatedUser });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

export default updatePackage;
