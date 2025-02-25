//write a controller to update procts from the database

import { Request, Response } from "express";
import Product from "../../models/product";
import { isValidHex, isValidURL } from "../../utils/helperFunctions";
import { ProductSizes, ProductStatus } from "../../types/types";
import { isValidObjectId } from "mongoose";

const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    description,
    price,
    discountedPrice,
    images,
    isFeatured,
    colorVariations,
    sizeVariations,
    status,
    link,
    isActive,
  } = req.body;

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

  if (
    (images && !Array.isArray(images)) ||
    (images && images.some((image: string) => !isValidURL(image)))
  ) {
    return res.status(400).json({
      message: "Images URL required and should be an array of valid URLs",
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

  if (isFeatured && typeof isFeatured !== "boolean") {
    return res.status(400).json({
      message: "Is Featured should be a boolean",
    });
  }

  if (description && typeof description !== "string") {
    return res.status(400).json({
      message: "Description should be a string",
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
      sizeVariations.some(
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

  try {
    const product = await Product.findOneAndUpdate(
      { _id: id },
      {
        title,
        description,
        price,
        discountedPrice,
        images,
        isFeatured,
        colorVariations,
        sizeVariations,
        link,
      },
      { new: true }
    );
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { updateProduct };
