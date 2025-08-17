import { Request, Response } from "express";
import User from "../models/user";
import { stripe } from "../utils/stripeInstance";
import NotificationSettings from "../models/notificationSettings";

class SocialLoginController {
  static async Execute(req: Request, res: Response) {
    const { email, name, loginProvider, role, token, FCMToken } = req.body;
    console.log(req.body);
    if (!email || !name || !loginProvider || !role || !token) {
      return res.status(400).send({
        message: "Invalid request",
      });
    }

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        // Only update token and FCMToken
        existingUser.token = token;
        existingUser.FCMToken = FCMToken;
        existingUser.lastLogin = new Date();

        await existingUser.save();

        const userWithoutPassword = existingUser.toJSON();
        delete userWithoutPassword.password;

        return res.status(200).send({
          message: "User updated successfully",
          user: userWithoutPassword,
        });
      } else {
        // Create Stripe customer for new user
        const customer = await stripe.customers.create({
          name: name.trim(),
          email: email.trim().toLowerCase(),
        });

        // Create new user
        const newUser = new User({
          name,
          email,
          loginProvider,
          role,
          token,
          FCMToken,
          emailVerified: true,
          stripeCustomerId: customer.id,
        });

        await newUser.save();

        // Create default notification settings
        const notificationSettings = new NotificationSettings({
          user: newUser._id,
        });

        await notificationSettings.save();

        const userWithoutPassword = newUser.toJSON();
        delete userWithoutPassword.password;

        return res.status(200).send({
          message: "User created successfully",
          user: userWithoutPassword,
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send({
        message: "Internal server error",
        error: err,
      });
    }
  }
}

module.exports = SocialLoginController;
