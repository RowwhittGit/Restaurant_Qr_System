//functions for admin home routes. This contains api for showing charts and graphs on admin home page


import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Get all orders for a given date
export const getOrdersByDate = async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) return res.status(400).json({ error: "Date query required" });

    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lt: end },
      },
      include: { items: { include: { menu: true } } },
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// 2. Daily sales (revenue + order count)
export const getDailySales = async (req, res) => {
  try {
    const sales = await prisma.$queryRaw`
      SELECT DATE("createdAt") as day, 
             SUM("totalPrice") as revenue, 
             COUNT(*) as orders
      FROM "Order"
      GROUP BY day
      ORDER BY day;
    `;
    
    // Convert BigInt values to Numbers
    const serializedSales = sales.map(sale => ({
      ...sale,
      revenue: Number(sale.revenue),
      orders: Number(sale.orders)
    }));
    
    res.json(serializedSales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// 3. Best-selling items
export const getBestSellers = async (req, res) => {
  try {
    const items = await prisma.$queryRaw`
      SELECT m.name, SUM(oi.quantity)::INTEGER as totalSold
      FROM "OrderItem" oi
      JOIN "Menu" m ON oi."menuId" = m.id
      GROUP BY m.name
      ORDER BY totalSold DESC
      LIMIT 5;
    `;
    
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// 4. Orders grouped by status
export const getOrdersByStatus = async (req, res) => {
  try {
    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
    });
    res.json(statusCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// 5. Peak hours (busiest hours)
export const getPeakHours = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = "";
    if (startDate && endDate) {
      filter = `WHERE "createdAt" >= '${startDate}' AND "createdAt" < '${endDate}'`;
    }

    const hours = await prisma.$queryRawUnsafe(`
      SELECT EXTRACT(HOUR FROM "createdAt") as hour, COUNT(*) as orderCount
      FROM "Order"
      ${filter}
      GROUP BY hour
      ORDER BY orderCount DESC;
    `);

    const formatted = hours.map(h => ({
      hour: Number(h.hour),
      orderCount: Number(h.ordercount || h.orderCount),
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

