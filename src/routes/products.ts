const productsRouter = require("express").Router();
const { postProduct } = require("../controllers/products/postProduct");
import { Request, Response } from "express";
import { getProducts } from "../controllers/products/getProducts";
import { getFeaturedProducts } from "../controllers/products/getFeaturedProducts";
import { updateProduct } from "../controllers/products/updateProduct";
import { deleteProduct } from "../controllers/products/deleteProduct";
import { getVendorProducts } from "../controllers/products/getVendorProducts";
import { getNewProducts } from "../controllers/products/getNewProducts";
import { getPopularProducts } from "../controllers/products/getPopularProducts";

productsRouter.post("/api/product", async (req: Request, res: Response) => {
  postProduct(req, res);
});

productsRouter.get("/api/product", async (req: Request, res: Response) => {
  getProducts(req, res);
});

productsRouter.get(
  "/api/product/featured",
  async (req: Request, res: Response) => {
    getFeaturedProducts(req, res);
  }
);

productsRouter.get(
  "/api/product/vendor/:id",
  async (req: Request, res: Response) => {
    getVendorProducts(req, res);
  }
);

productsRouter.get("/api/product/new", async (req: Request, res: Response) => {
  getNewProducts(req, res);
});

productsRouter.get(
  "/api/product/popular",
  async (req: Request, res: Response) => {
    getPopularProducts(req, res);
  }
);

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
