import { Request, Response } from "express";
import { isValidEmail } from "../utils/helperFunctions";
import User from "../models/user";
import { redisClient } from "../database/redis-clinet";
import { sendEmail } from "../utils/mailer";
const otpGenerator = require("otp-generator");
import bcrypt from "bcrypt";

class ForgotPasswordController {
  static async Execute(req: Request, res: Response) {
    const { email } = req.body;

    if (!email || email === "" || !isValidEmail(email)) {
      return res.status(400).send({
        message: "Email is required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user || Object.keys(user).length == 0) {
      return res.status(400).send({
        message: "User not found.",
      });
    }

    const otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    redisClient.setEx(`otp-${user._id.toString()}`, 696, otp);

    sendEmail({
      to: user.email,
      subject: "Forgot Password OTP",
      templateName: "forgotPasswordOTP.html",
      variables: {
        userName: user.name,
        otpCode: otp,
      },
    });

    res.status(200).send({
      message: "Password Reset Email sent.",
    });
  }

  static async verifyOTP(req: Request, res: Response) {
    const { email, otp } = req.body;

    if (!email || email === "" || !isValidEmail(email)) {
      return res.status(400).send({
        message: "Email is required.",
      });
    }

    if (!otp || otp === "") {
      return res.status(400).send({
        message: "OTP is required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user || Object.keys(user).length == 0) {
      return res.status(400).send({
        message: "User not found.",
      });
    }

    const storedOTP = await redisClient.get(`otp-${user._id.toString()}`);

    if (storedOTP !== otp) {
      return res.status(400).send({
        message: "Invalid OTP.",
      });
    }

    res.status(200).send({
      message: "OTP verified successfully.",
    });
  }

  static async resetPassword(req: Request, res: Response) {
    const { email, password, otp } = req.body;
    console.log(email, password, otp);
    const PASSWORD_REGEX =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/;
    const saltRounds = 10;

    if (!email || email === "" || !isValidEmail(email)) {
      return res.status(400).send({
        message: "Email is required.",
      });
    }

    // Validate the password against the regex
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).send({
        message:
          "Password must be 8-20 characters long, with at least one uppercase, one lowercase, one digit, and one special character.",
      });
    }

    if (!password || password === "") {
      return res.status(400).send({
        message: "Password is required.",
      });
    }

    if (!otp || otp === "") {
      return res.status(400).send({
        message: "token is required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user || Object.keys(user).length == 0) {
      return res.status(400).send({
        message: "User not found.",
      });
    }

    const storedOTP = await redisClient.get(`otp-${user._id.toString()}`);

    if (storedOTP !== otp) {
      return res.status(400).send({
        message: "Invalid OTP.",
      });
    }

    bcrypt.hash(password, saltRounds).then(async function (hash: string) {
      user.password = hash;
      await user.save();

      await redisClient.del(`otp-${user._id.toString()}`);

      res.status(200).send({
        message: "Password reset successfully.",
      });
    });
  }
}

module.exports = ForgotPasswordController;
