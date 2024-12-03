const productsRouter = require("express").Router();
const { postProduct } = require("../controllers/products/postProduct");
import { Request, Response } from "express";
import { getProducts } from "../controllers/products/getProducts";
import { updateProduct } from "../controllers/products/updateProduct";
import { deleteProduct } from "../controllers/products/deleteProduct";

productsRouter.post("/api/product", async (req: Request, res: Response) => {
  postProduct(req, res);
});

productsRouter.get("/api/products", async (req: Request, res: Response) => {
  getProducts(req, res);
});

productsRouter.put("/api/product/:id", async (req: Request, res: Response) => {
  updateProduct(req, res);
});

productsRouter.delete(
  "/api/product/:id",
  async (req: Request, res: Response) => {
    deleteProduct(req, res);
  }
);

module.exports = productsRouter;
