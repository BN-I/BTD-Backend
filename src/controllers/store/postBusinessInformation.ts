import { Request, Response } from "express";
import BusinessInformation from "../../models/businessInformation";

const postBusinessInformation = async (req: Request, res: Response) => {
  const {
    vendorID,
    businessType,
    taxID,
    businessEmail,
    businessPhone,
    businessAddress,
    city,
    state,
    postalCode,
    country,
    storePolicy,
    returnPolicy,
  } = req.body;

  if (
    !vendorID ||
    !businessType ||
    !taxID ||
    !businessEmail ||
    !businessPhone ||
    !businessAddress ||
    !city ||
    !state ||
    !postalCode ||
    !country ||
    !storePolicy ||
    !returnPolicy
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const updatedBusinessInformation =
      await BusinessInformation.findOneAndUpdate(
        { vendorID: vendorID },
        {
          businessType,
          taxID,
          businessEmail,
          businessPhone,
          businessAddress,
          city,
          state,
          postalCode,
          country,
          storePolicy,
          returnPolicy,
        },
        { upsert: true, new: true }
      );

    res.status(200).json(updatedBusinessInformation);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export default postBusinessInformation;
