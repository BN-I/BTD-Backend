import { Request, Response } from "express";
import User from "../models/user";
import { stripe } from "../utils/stripeInstance";
import NotificationSettings from "../models/notificationSettings";

class SocialLoginController {
  static async Execute(req: Request, res: Response) {
    const { email, name, loginProvider, role, token, FCMToken, appleUserId } =
      req.body;
    console.log(req.body);

    if (!loginProvider || !role || !token) {
      return res.status(400).send({ message: "Invalid request" });
    }

    try {
      const normalizedEmail = email ? email.trim().toLowerCase() : null;
      let user;

      if (normalizedEmail) {
        user = await User.findOne({ email: normalizedEmail });
      } else if (loginProvider === "Apple") {
        user = await User.findOne({ appleUserId });
      }

      if (user) {
        user.token = token;
        if (FCMToken) user.FCMToken = FCMToken;
        user.lastLogin = new Date();
        await user.save();

        const userWithoutPassword = user.toJSON();
        delete userWithoutPassword.password;

        return res.status(200).send({
          message: "User updated successfully",
          user: userWithoutPassword,
        });
      } else {
        if (!normalizedEmail) {
          return res.status(400).send({
            message:
              "Apple did not return an email. Cannot create new user without an email.",
          });
        }

        // Create Stripe customer for new user
        const customer = await stripe.customers.create({
          name: name?.trim(),
          email: normalizedEmail,
        });

        // Create new user
        const newUser = new User({
          name: name?.trim(),
          email: normalizedEmail,
          loginProvider,
          role,
          token,
          FCMToken,
          emailVerified: true,
          stripeCustomerId: customer.id,
          appleUserId,
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
      console.error("SocialLoginController error:", err);
      return res.status(500).send({
        message: "Internal server error",
        error: err,
      });
    }
  }
}

module.exports = SocialLoginController;
