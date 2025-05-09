import { Request, Response } from "express";
import User from "../../models/user";

const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await User.find({ role: "Admin" });
    res.status(200).json(admins);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e });
  }
};

export { getAllAdmins };
