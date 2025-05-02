import { Request, Response } from "express";
import { UserStatus } from "../../types/types";
import User from "../../models/user";
const changeUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID is not valid" });
  }

  if (!status || !Object.values(UserStatus).includes(status)) {
    return res.status(400).json({ message: "Status is not valid" });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.status = status;
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export default changeUserStatus;
