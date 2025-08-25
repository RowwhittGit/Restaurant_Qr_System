// KitchenDashboard.tsx
import React, { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  createdAt: string;
}

interface Order {
  id: number;
  tableId: number;
  items: OrderItem[];
  totalItems: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const socket: Socket = io("http://localhost:3000");

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    socket.emit("join_room", { userType: "kitchen" });

    socket.on("newOrder", (order: Order) => {
      setOrders((prev) => [order, ...prev]);
      console.log("🍔 New order received:", order);
    });

    return () => {
      socket.off("newOrder");
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Kitchen Dashboard</h2>
      {orders.map((order) => (
        <div key={order.id} className="border p-2 mb-2">
          <p>Table #{order.tableId}</p>
          <p>Status: {order.status}</p>
          <ul>
            {order.items.map((item) => (
              <li key={item.id}>
                {item.quantity} x {item.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}