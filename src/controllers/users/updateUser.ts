import { Request, Response } from "express";
import User from "../../models/user";
const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phoneNumber, countryCode, address } = req.body;
  const user = await User.findById(id);

  console.log(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  user.name = name;
  user.phoneNumber = phoneNumber;
  user.countryCode = countryCode;
  user.streetAddress = address;

  try {
    await user
      .save()
      .then((user: any) =>
        res.json({
          message: "User updated successfully",
          user,
        })
      )
      .catch((err: any) => res.status(500).json({ message: err }));
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

module.exports = updateUser;
