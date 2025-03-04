import { Request, Response } from "express";
import User from "../models/user";
import { UserInfo } from "os";
import { stripe } from "../utils/stripeInstance";
import NotificationSettings from "../models/notificationSettings";

class SocialLoginController {
  static async Execute(req: Request, res: Response) {
    const { email, name, loginProvider, role, token, FCMToken } = req.body;

    console.log("FCMToken", FCMToken);

    if (!email || !name || !loginProvider || !role || !token) {
      return res.status(400).send({
        message: "Invalid request",
      });
    }
    try {
      const customer = await stripe.customers.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });

      User.findOneAndUpdate(
        { email: email },
        {
          name,
          loginProvider,
          role,
          token,
          emailVerified: true,
          stripeCustomerId: customer.id,
          FCMToken,
        },
        { upsert: true, new: true }
      )
        .then(async (currentUser: any) => {
          const userWithoutPassword = currentUser.toJSON(); // Converts Sequelize model instance to plain object
          delete userWithoutPassword.password;
          const notificationSettings = new NotificationSettings({
            user: currentUser._id, // Link to the user
          });
          await notificationSettings
            .save()
            .catch((err: any) => console.log(err));
          res.status(200).send({
            message: "User created successfully",
            user: userWithoutPassword,
          });
        })
        .catch((err: any) => {
          res.status(500).send(err);
        });
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
}

module.exports = SocialLoginController;
