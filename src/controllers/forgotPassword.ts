import { Request, Response } from "express";

class ForgotPasswordController {
  static async Execute(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        message: "Email is required.",
      });
    }

    res.status(200).send({
      message: "Password Reset Email sent.",
    });
  }
}

module.exports = ForgotPasswordController;
