// analyticsController.js
import { PrismaClient } from "@prisma/client";
import {format, subDays} from 'date-fns'
const prisma = new PrismaClient();


export const getWeeklySales = async (req, res) => {
    try {
    const today = new Date();

    // Start date = 6 days before today (so total 7 days)
    const startDate = subDays(today, 6);

    // Fetch PAID orders in the last 7 days
    const orders = await prisma.order.findMany({
      where: {
        status: "PAID",
        createdAt: {
          gte: startDate,
          lte: today,
        },
      },
      select: {
        createdAt: true,
        totalPrice: true,
      },
    });

    // Initialize a map for last 7 days
    const result = [];
    for (let i = 0; i < 7; i++) {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayName = format(date, "EEEE");

      // Filter orders for this date
      const dayOrders = orders.filter(
        (o) => format(o.createdAt, "yyyy-MM-dd") === dateStr
      );

      const totalOrders = dayOrders.length;
      const totalRevenue = dayOrders.reduce(
        (sum, o) => sum + o.totalPrice,
        0
      );

      result.push({
        day: dayName,
        date: dateStr,
        totalOrders,
        totalRevenue,
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching weekly sales:", error);
    res.status(500).json({ error: "Failed to fetch weekly sales" });
  }
}
