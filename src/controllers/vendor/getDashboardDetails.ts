import { Request, Response } from "express";
import Order from "../../models/order";

const getDashboardDetails = async (req: Request, res: Response) => {
  const { id } = req.params;

  const allOrder = await Order.find({ vendor: id });

  const totalRevenue = allOrder.reduce((acc: number, order: any) => {
    return acc + order.totalAmount;
  }, 0);

  const averageOrderValue = totalRevenue / allOrder.length;

  const totalBalance = allOrder.reduce((acc: number, order: any) => {
    if (!order.amountDispatched) {
      return acc + order.totalAmount;
    } else {
      return acc;
    }
  }, 0);

  const ordersCompleted = allOrder.filter((order: any) => {
    return order.status === "delivered";
  }).length;

  const orderCancelled = allOrder.filter((order: any) => {
    return order.status === "cancelled";
  }).length;

  const orderProcessing = allOrder.filter((order: any) => {
    return order.status === "processing";
  }).length;

  const orderShipped = allOrder.filter((order: any) => {
    return order.status === "shipped";
  }).length;

  console.log("totalRevenue", totalRevenue);
  console.log("averageOrderValue", averageOrderValue);
  console.log("totalBalance", totalBalance);
  console.log("ordersCompleted", ordersCompleted);
  console.log("orderCancelled", orderCancelled);
  console.log("orderProcessing", orderProcessing);
  console.log("orderShipped", orderShipped);

  res.status(200).json({
    allOrder,
    totalRevenue,
    averageOrderValue,
    totalBalance,
    ordersCompleted,
    orderCancelled,
    orderProcessing,
    orderShipped,
  });
};

export default getDashboardDetails;
