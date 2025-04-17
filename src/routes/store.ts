const storeRouter = require("express").Router();
import { Request, Response } from "express";
import getBusinessInformation from "../controllers/store/getBusinessInformation";
import { get } from "mongoose";
import getStoreInformation from "../controllers/store/getStoreInformation";
import postBusinessInformation from "../controllers/store/postBusinessInformation";
import postStoreInformation from "../controllers/store/postStoreInformation";
import getPaymentInformation from "../controllers/store/getPaymentInformation";
import { postPaymentInformation } from "../controllers/store/postPaymentInformation";
import { postStoreLogo } from "../controllers/store/postStoreLogo";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

storeRouter.get(
  "/api/store/businessInformation/:id",
  async (req: Request, res: Response) => {
    getBusinessInformation(req, res);
  }
);

storeRouter.get(
  "/api/store/storeInformation/:id",
  async (req: Request, res: Response) => {
    getStoreInformation(req, res);
  }
);

storeRouter.get(
  "/api/store/paymentInformation/:id",
  async (req: Request, res: Response) => {
    getPaymentInformation(req, res);
  }
);

storeRouter.post(
  "/api/store/paymentInformation",
  async (req: Request, res: Response) => {
    postPaymentInformation(req, res);
  }
);

storeRouter.post(
  "/api/store/businessInformation",
  async (req: Request, res: Response) => {
    postBusinessInformation(req, res);
  }
);

storeRouter.post(
  "/api/store/storeInformation",
  async (req: Request, res: Response) => {
    postStoreInformation(req, res);
  }
);

storeRouter.post(
  "/api/store/logo",
  upload.single("file"),
  async (req: Request, res: Response) => {
    postStoreLogo(req, res);
  }
);

module.exports = storeRouter;
