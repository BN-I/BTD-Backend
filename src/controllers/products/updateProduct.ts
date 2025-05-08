//write a controller to update procts from the database

import { Request, Response } from "express";
import Product from "../../models/product";
import { isValidHex, isValidURL } from "../../utils/helperFunctions";
import { ProductSizes, ProductStatus } from "../../types/types";
import { isValidObjectId } from "mongoose";
import { uploadImages } from "../../service/s3Bucket";
import { stat } from "node:fs";

const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    description,
    category,
    isFeatured,
    status,
    link,
    orderMaxDays,
    orderMinDays,
  } = req.body;

  let sizeVariations;
  let colorVariations;
  let price;
  let discountedPrice;

  if (req.body.price) {
    price = parseFloat(req.body.price);
  }

  if (req.body.discountedPrice) {
    discountedPrice = req.body.discountedPrice
      ? parseFloat(req.body.discountedPrice)
      : null;
  }

  if (req.body.sizeVariations && typeof req.body.sizeVariations === "string") {
    sizeVariations = [req.body.sizeVariations];
  } else {
    sizeVariations = req.body.sizeVariations;
  }

  console.log(req.body.colorVariations);

  if (
    req.body.colorVariations &&
    typeof req.body.colorVariations === "string"
  ) {
    colorVariations = [req.body.colorVariations];
  } else {
    colorVariations = req.body.colorVariations;
  }

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Product ID is not valid",
    });
  }

  if (title && typeof title !== "string") {
    return res.status(400).json({
      message: "Title is not valid",
    });
  }

  if (price && isNaN(price)) {
    return res.status(400).json({
      message: "Price is not valid ",
    });
  }

  if (discountedPrice && isNaN(discountedPrice)) {
    return res.status(400).json({
      message: "Discounted Price is not valid",
    });
  }

  if (isFeatured && typeof isFeatured !== "string") {
    return res.status(400).json({
      message: "Is Featured should be a string",
    });
  }

  if (description && typeof description !== "string") {
    return res.status(400).json({
      message: "Description should be a string",
    });
  }

  if (category && typeof category !== "string") {
    return res.status(400).json({
      message: "Category should be a string",
    });
  }

  if (
    (colorVariations && !Array.isArray(colorVariations)) ||
    (colorVariations &&
      colorVariations.some((color: string) => !isValidHex(color)))
  ) {
    return res.status(400).json({
      message: "Color Variations should be an array of hex codes",
    });
  }

  if (
    (sizeVariations && !Array.isArray(sizeVariations)) ||
    (sizeVariations &&
      (sizeVariations as unknown as string[]).some(
        (size: string) =>
          !Object.values(ProductSizes).includes(size as ProductSizes)
      ))
  ) {
    return res.status(400).json({
      message:
        "Size Variations should be an array of valid sizes. Ex: " +
        Object.values(ProductSizes).join(", "),
    });
  }

  if (status && !Object.values(ProductStatus).includes(status)) {
    return res.status(400).json({
      message:
        `Status should be one of ` + Object.values(ProductStatus).join(", "),
    });
  }

  if (link && !isValidURL(link)) {
    return res.status(400).json({
      message: "Link should be a valid URL",
    });
  }

  if (orderMaxDays && isNaN(orderMaxDays)) {
    return res.status(400).json({
      message: "orderMaxDays is not valid",
    });
  }

  if (orderMinDays && isNaN(orderMinDays)) {
    return res.status(400).json({
      message: "orderMinDays is not valid",
    });
  }

  try {
    let images;

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Upload new images if provided
      images = await uploadImages(req.files, process.env.AWS_S3_BUCKET_NAME!);
    }

    // Prepare update object
    const updateFields: any = {
      title,
      description,
      category: category?.trim(),
      price,
      discountedPrice,
      isFeatured: isFeatured === "true",
      colorVariations,
      sizeVariations,
      status,
      link,
      orderMaxDays,
      orderMinDays,
    };

    // Only add images to update if new images were uploaded
    if (images) {
      updateFields.images = images;
    }

    const product = await Product.findOneAndUpdate({ _id: id }, updateFields, {
      new: true,
    });

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { updateProduct };
