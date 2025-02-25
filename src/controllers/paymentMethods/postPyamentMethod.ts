import { Request, Response } from "express";
import paymentMethod from "../../models/paymentMethod";
import { isValidObjectId } from "mongoose";

const postPaymentMethod = async (req: Request, res: Response) => {
  const {
    holderName,
    cardNumber,
    expiryMonth,
    expiryYear,
    cvv,
    postalCode,
    user,
  } = req.body;

  if (!holderName || holderName === "" || typeof holderName !== "string") {
    return res.status(400).json({
      message: "holderName is not valid or missing",
    });
  }

  if (
    !cardNumber ||
    cardNumber === "" ||
    typeof cardNumber !== "string" ||
    cardNumber.length !== 16
  ) {
    return res.status(400).json({
      message: "cardNumber is not valid or missing",
    });
  }

  if (
    !expiryMonth ||
    expiryMonth === "" ||
    typeof expiryMonth !== "string" ||
    expiryMonth.length !== 2
  ) {
    return res.status(400).json({
      message: "expiryMonth is not valid or missing",
    });
  }

  try {
    if (parseInt(expiryMonth) < 1 || parseInt(expiryMonth) > 12) {
      return res.status(400).json({
        message: "expiryMonth is not valid or missing",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }

  if (
    !expiryYear ||
    expiryYear === "" ||
    typeof expiryYear !== "string" ||
    expiryYear.length !== 4
  ) {
    return res.status(400).json({
      message: "expiry year is not valid or missing",
    });
  }

  try {
    if (
      parseInt(expiryYear) < new Date().getFullYear() ||
      parseInt(expiryYear) > new Date().getFullYear() + 25
    ) {
      return res.status(400).json({
        message: "expiry year is not valid or missing",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }

  if (!cvv || cvv === "" || typeof cvv !== "string" || cvv.length !== 3) {
    return res.status(400).json({
      message: "cvv is not valid or missing",
    });
  }

  if (!postalCode || postalCode === "" || typeof postalCode !== "string") {
    return res.status(400).json({
      message: "postalCode is not valid or missing",
    });
  }

  if (!user || user === "" || !isValidObjectId(user)) {
    return res.status(400).json({
      message: "user is not valid or missing",
    });
  }

  try {
    const paymentMethodObject = await paymentMethod.create({
      holderName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      postalCode,
      user,
    });
    return res.status(201).json(paymentMethodObject);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export { postPaymentMethod };
