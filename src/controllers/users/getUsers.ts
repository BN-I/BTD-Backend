import { Request, Response } from "express";
import User from "../../models/user";
const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: "User" });
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

export default getUsers;
