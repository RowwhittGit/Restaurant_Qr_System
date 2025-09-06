// analyticsController.js
import { PrismaClient } from "@prisma/client";
import {format, subDays} from 'date-fns'
const prisma = new PrismaClient();

// Done.
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

//Todays peak sales time (hourly breakdown)
export const getTodaysPeakSales = async (req, res) => {
  try {
    const now = new Date();

    // Define start & end of today in UTC (9:00 - 23:00 UTC)
    const startOfDay = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      9, 0, 0
    ));

    const endOfDay = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23, 0, 0
    ));

    // Get all PAID orders in today's range
    const orders = await prisma.order.findMany({
      where: {
        status: "PAID",
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        createdAt: true,
        totalPrice: true,
      },
    });

    // Generate hourly slots (9:00 → 23:00 UTC)
    const result = [];
    for (let hour = 9; hour < 24; hour++) {
      const slotStart = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        hour, 0, 0
      ));

      const slotEnd = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        hour + 1, 0, 0
      ));

      // Filter orders in this slot
      const slotOrders = orders.filter(
        (o) => o.createdAt >= slotStart && o.createdAt < slotEnd
      );

      result.push({
        timeRange: `${hour}:00 - ${hour + 1}:00`,
        orders: slotOrders.length,
        revenue: slotOrders.reduce((sum, o) => sum + o.totalPrice, 0),
      });
    }

    // Debug logs (can be removed later)
    console.log("startOfDay (UTC):", startOfDay);
    console.log("endOfDay (UTC):", endOfDay);
    console.log("orders found:", orders.map(o => o.createdAt));

    res.json(result);
  } catch (error) {
    console.error("Error fetching peak sales:", error);
    res.status(500).json({ error: "Failed to fetch peak sales" });
  }
};


//Get the top 5 best selling menu items (by quantity sold) in the last 7 days
export async function getWeeklyBestSellers() {
  const today = new Date()
  const weekStart = new Date()
  weekStart.setDate(today.getDate() - 6)
  
  // Set time to start/end of day for better performance
  weekStart.setHours(0, 0, 0, 0)
  today.setHours(23, 59, 59, 999)

  const result = await prisma.$queryRaw`
    SELECT 
      m.id as "menuId",
      m.name,
      m.price,
      SUM(oi.quantity) as "totalSold",
      SUM(oi.quantity * m.price) as "totalRevenue"
    FROM "OrderItem" oi
    INNER JOIN "Order" o ON oi."orderId" = o.id
    INNER JOIN "Menu" m ON oi."menuId" = m.id
    WHERE o."status" = 'PAID'
      AND o."createdAt" >= ${weekStart}
      AND o."createdAt" <= ${today}
    GROUP BY m.id, m.name, m.price
    ORDER BY SUM(oi.quantity) DESC
    LIMIT 5;
  `

  return result
}