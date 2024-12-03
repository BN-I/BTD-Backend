import { Request, Response } from "express";
import User from "../models/user";
import { UserInfo } from "os";

class SocialLoginController {
  static async Execute(req: Request, res: Response) {
    const { email, name, loginProvider, role, token } = req.body;

    if (!email || !name || !loginProvider || !role || !token) {
      return res.status(400).send({
        message: "Invalid request",
      });
    }
    try {
      User.findOneAndUpdate(
        { email: email },
        {
          name,
          loginProvider,
          role,
          token,
        },
        { upsert: true, new: true }
      )
        .then((currentUser: any) => {
          res.status(200).send({
            message: "User created successfully",
            user: currentUser,
          });
        })
        .catch((err: any) => {
          res.status(500).send(err);
        });
    } catch (err) {
      res.status(500).send(err);
    }
  }
}

module.exports = SocialLoginController;
