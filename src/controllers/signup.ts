import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import { LoginProvider, UserRole } from "../types/types";
import { stripe } from "../utils/stripeInstance";
import notificationSetrtings from "../models/notificationSettings";
import NotificationSettings from "../models/notificationSettings";
import { isValidEmail } from "../utils/helperFunctions";

class SignupController {
  static async Execute(req: Request, res: Response) {
    const PASSWORD_REGEX =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/;
    const saltRounds = 10;

    const { name, email, password, loginProvider, role } = req.body;

    if (!name || !email || !password || !loginProvider || !role) {
      return res.status(400).send({
        message: "Invalid request",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).send({
        message: "Invalid email provided.",
      });
    }

    // Check if role is a valid UserRole
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).send({
        message: "Invalid role provided.",
      });
    }

    // Check if loginProvider is a valid loginProvider
    if (!Object.values(LoginProvider).includes(loginProvider)) {
      return res.status(400).send({
        message: "Invalid loginProvider provided.",
      });
    }

    // Validate the password against the regex
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).send({
        message:
          "Password must be 8-20 characters long, with at least one uppercase, one lowercase, one digit, and one special character.",
      });
    }

    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).send({
        message: "User already exists",
      });
    }

    try {
      bcrypt.hash(password, saltRounds).then(async function (hash: string) {
        const customer = await stripe.customers.create({
          name: name.trim(),
          email: email.trim().toLowerCase(),
        });

        const newUser = await User.create({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: hash,
          loginProvider: loginProvider,
          role: role,
          stripeCustomerId: customer.id,
        });

        const notificationSettings = new NotificationSettings({
          user: newUser._id, // Link to the user
        });
        await notificationSettings.save().catch((err: any) => console.log(err));

        const userWithoutPassword = newUser.toJSON(); // Converts Sequelize model instance to plain object
        delete userWithoutPassword.password;

        res.status(200).send({
          message: "User created successfully",
          user: userWithoutPassword,
        });

        return;
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error creating user",
      });
    }
  }
}

module.exports = SignupController;
