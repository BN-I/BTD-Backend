import { Request, Response } from "express";
import sharp from "sharp";

const resizeImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    const resized = await sharp(req.file.buffer)
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();

    res.set("Content-Type", "image/webp");
    res.send(resized);
  } catch (err) {
    res.status(500).json({ error: "Image processing failed" });
  }
};

export { resizeImage };
