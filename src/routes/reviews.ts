import { Request, Response } from "express";

const reviewRouter = require("express").Router();
const { postReview } = require("../controllers/reviews/postReview");
const { updateReview } = require("../controllers/reviews/updateReview");
const { deleteReview } = require("../controllers/reviews/deleteReview");
const {
  getProductReviews,
} = require("../controllers/reviews/getProductReviews");
const { getOrderReviews } = require("../controllers/reviews/getOrderReviews");
const {
  deleteReviewAsAdmin,
} = require("../controllers/reviews/deleteReviewAsAdmin");
const {
  getVendorReviews,
} = require("../controllers/reviews/getVendorReviews");
const { reportReview } = require("../controllers/reviews/reportReview");
const {
  getReportedReviews,
} = require("../controllers/reviews/getReportedReviews");
const {
  dismissReportedReview,
} = require("../controllers/reviews/dismissReportedReview");

reviewRouter.post("/api/reviews", async (req: Request, res: Response) => {
  postReview(req, res);
});

reviewRouter.put("/api/reviews/:id", async (req: Request, res: Response) => {
  updateReview(req, res);
});

reviewRouter.delete(
  "/api/reviews/:id",
  async (req: Request, res: Response) => {
    deleteReview(req, res);
  }
);

reviewRouter.get(
  "/api/reviews/product/:id",
  async (req: Request, res: Response) => {
    getProductReviews(req, res);
  }
);

reviewRouter.get(
  "/api/reviews/order/:id",
  async (req: Request, res: Response) => {
    getOrderReviews(req, res);
  }
);

reviewRouter.delete(
  "/api/admin/reviews/:id",
  async (req: Request, res: Response) => {
    deleteReviewAsAdmin(req, res);
  }
);

reviewRouter.get(
  "/api/reviews/vendor/:id",
  async (req: Request, res: Response) => {
    getVendorReviews(req, res);
  }
);

reviewRouter.post(
  "/api/reviews/:id/report",
  async (req: Request, res: Response) => {
    reportReview(req, res);
  }
);

reviewRouter.get(
  "/api/admin/reviews/reported",
  async (req: Request, res: Response) => {
    getReportedReviews(req, res);
  }
);

reviewRouter.put(
  "/api/admin/reviews/:id/dismiss",
  async (req: Request, res: Response) => {
    dismissReportedReview(req, res);
  }
);

module.exports = reviewRouter;
