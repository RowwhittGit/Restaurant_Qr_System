// analyticsController.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const getDateRange = (period, startDate, endDate) => {
  const now = new Date();

  switch (period) {
    case "today":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
      };

    case "week": {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59);

      return { start: startOfWeek, end: endOfWeek };
    }

    case "month":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      };

    case "custom":
      if (!startDate || !endDate) {
        throw new Error("Custom period requires startDate and endDate");
      }
      return {
        start: new Date(startDate),
        end: new Date(endDate),
      };

    default:
      throw new Error("Invalid period");
  }
};

/* ------------------------- Summary Data (Revenue + Orders) ------------------------- */
//havent tested this one as well
export const getSummaryData = async (dateRange) => {
  const result = await prisma.order.aggregate({
    where: {
      status: "PAID",
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    _sum: { totalPrice: true },
    _count: { id: true },
  });

  return {
    totalRevenue: result._sum.totalPrice || 0,
    totalOrders: result._count.id || 0,
  };
};

//havent tested this one
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = "today", startDate, endDate } = req.query;

    const dateRange = getDateRange(period, startDate, endDate);
    const summary = await getSummaryData(dateRange);

    res.json({
      success: true,
      data: {
        ...summary,
        period,
        dateRange: {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString(),
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          currency: "NPR",
        },
      },
    });
  } catch (error) {
    console.error("Revenue analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue analytics",
    });
  }
};

//needs update on the date
export const getPeakTodaySales = async (req, res) => {
  try {
    const { date } = req.query; // format: YYYY-MM-DD
    const targetDate = date ? new Date(date) : new Date();
    console.log("Target date for peak sales:", targetDate);

    // get start & end of the day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // fetch all paid orders of that day
    const orders = await prisma.order.findMany({
      where: {
        status: "PAID",
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        items: {
          include: { menu: true },
        },
      },
    });

    // bucketize by hours
    const buckets = Array.from({ length: 24 }, (_, i) => ({
      timeRange: `${i}:00 - ${i + 1}:00`,
      orders: 0,
      revenue: 0,
    }));

    orders.forEach((order) => {
      const hour = order.createdAt.getHours();
      buckets[hour].orders += 1;
      buckets[hour].revenue += order.totalPrice;
    });

    res.json({
      success: true,
      data: buckets,
    });
  } catch (err) {
    console.error("Peak sales error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
