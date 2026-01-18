import { Request, Response } from "express";
import StoreInformation from "../../models/storeInformation";

const postStoreInformation = async (req: Request, res: Response) => {
  const {
    vendorID,
    storeName,
    storeDescription,
    businessCategory,
    companySize,
    yearFounded,
    website,
    carrier,
    instagram,
    facebook,
    twitter,
  } = req.body;

  if (
    !vendorID ||
    !storeName ||
    !storeDescription ||
    !businessCategory ||
    !carrier
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    //update and upsert the data

    const updatedStoreInformation = await StoreInformation.findOneAndUpdate(
      { vendorID: vendorID },
      {
        $set: {
          storeName,
          storeDescription,
          businessCategory,
          companySize,
          yearFounded,
          website,
          carrier,
          instagram,
          facebook,
          twitter,
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json(updatedStoreInformation);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export default postStoreInformation;
