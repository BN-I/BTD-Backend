import axios from "axios";
import { Request, Response } from "express";
const getCarriers = async (req: Request, res: Response) => {
  const carriers = await axios.get("https://api.shipengine.com/v1/carriers", {
    headers: {
      "Content-Type": "application/json",
      "API-Key": process.env.SHIPENGINE_API_KEY || "",
    },
  });

  res.status(200).json(carriers.data);
};

export { getCarriers };
