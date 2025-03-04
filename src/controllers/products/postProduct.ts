import e, { Request, Response } from "express";
import Product from "../../models/product";
import { isValidObjectId } from "mongoose";
import { isValidHex, isValidURL } from "../../utils/helperFunctions";
import { ProductSizes, ProductStatus } from "../../types/types";
import { uploadImages } from "../../service/s3Bucket";
import { error } from "console";

const postProduct = async (req: Request, res: Response) => {
  console.log(req.body);
  console.log(req.files);

  const {
    title,
    description,
    category,
    isFeatured,
    vendorID,
    status,
    link,
    orderMaxDays,
    orderMinDays,
  } = req.body;

  const price = parseFloat(req.body.price);
  const discountedPrice = req.body.discountedPrice
    ? parseFloat(req.body.discountedPrice)
    : null;

  //converting sizeVariations to array if single
  let sizeVariations;
  let colorVariations;
  if (req.body.sizeVariations && typeof req.body.sizeVariations === "string") {
    sizeVariations = [req.body.sizeVariations];
  } else {
    sizeVariations = req.body.sizeVariations;
  }

  if (
    req.body.colorVariations &&
    typeof req.body.colorVariations === "string"
  ) {
    colorVariations = [req.body.colorVariations];
  } else {
    colorVariations = req.body.colorVariations;
  }

  if (!title || title === "" || typeof title !== "string") {
    return res.status(400).json({
      message: "Title is not valid or missing",
    });
  }

  if (!price || isNaN(price)) {
    return res.status(400).json({
      message: "Price is not valid or missing",
    });
  }

  if (!vendorID || isValidObjectId(vendorID) === false) {
    return res.status(400).json({
      message: "Vendor ID is not valid",
    });
  }

  if (!orderMaxDays || isNaN(orderMaxDays)) {
    return res.status(400).json({
      message: "orderMaxDays is not valid",
    });
  }

  if (!orderMinDays || isNaN(orderMinDays)) {
    return res.status(400).json({
      message: "orderMinDays is not valid",
    });
  }

  //check Non Required Values and their types

  if (discountedPrice && isNaN(discountedPrice)) {
    return res.status(400).json({
      message: "Discounted Price is not valid or missing",
    });
  }

  if (isFeatured != undefined && typeof isFeatured !== "string") {
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
    colorVariations &&
    (!Array.isArray(colorVariations) ||
      colorVariations.some((color: string) => !isValidHex(color)))
  ) {
    return res.status(400).json({
      message: "Color Variations should be an array of hex codes",
    });
  }

  if (
    sizeVariations &&
    (!Array.isArray(sizeVariations) ||
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

  try {
    const images = await uploadImages(req.files);
    const product = await Product.create({
      title: title.trim(),
      description: description?.trim(),
      category: category?.trim(),
      price: parseFloat(price.toFixed(2)),
      discountedPrice: discountedPrice
        ? parseFloat(discountedPrice.toFixed(2))
        : null,
      images,
      isFeatured: isFeatured === "true",
      colorVariations,
      sizeVariations,
      vendor: vendorID,
      status,
      link,
      orderMaxDays,
      orderMinDays,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err });
  }
};

export { postProduct };
