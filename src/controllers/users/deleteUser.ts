import User from "../../models/user";
import { Request, Response } from "express";

const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await User.findById(id);

    user.status = "Deleted";
    user.name = `Deleted User`;
    user.email = `Deleted User`;
    await user.save();
    const users = await User.find({ role: "User" });

    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

module.exports = deleteUser;
