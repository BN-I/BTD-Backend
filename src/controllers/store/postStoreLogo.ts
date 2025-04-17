import { Request, Response } from "express";
import { uploadImage, uploadImages } from "../../service/s3Bucket";
import storeInformation from "../../models/storeInformation";

const postStoreLogo = async (req: Request, res: Response) => {
  try {
    const { vendorID } = req.body;

    console.log(req.file);

    if (!vendorID || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const image = await uploadImage(
      req.file,
      process.env.AWS_S3_STORE_IMAGE_BUCKET_NAME!
    );

    if (!image) {
      return res.status(400).json({ message: "Image upload failed" });
    }

    await storeInformation.findOneAndUpdate(
      { vendorID: vendorID },
      { storeImage: image },
      { new: true }
    );

    res.status(200).json({ message: "Image uploaded successfully", image });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error });
  }
};

export { postStoreLogo };
