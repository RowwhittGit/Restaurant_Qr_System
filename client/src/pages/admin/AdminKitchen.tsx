import React, { useState, useEffect } from "react";
import { AlertCircle, RefreshCw, Clock } from "lucide-react";
import axios from "axios";
import io from "socket.io-client";
import BottomNav from "../../components/BottomNav";
import Toast, { useToast } from "../../components/Toast";

interface OrderItem {
  id: number;
  quantity: number;
  menu: {
    id: number;
    name: string;
    price: number;
    category: string[];
  };
}

interface Order {
  id: number;
  tableId: number;
  totalItems: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const socket = io("http://localhost:3000");

const statusOptions = [
  { value: "PENDING", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "CONFIRMED", label: "Confirmed", color: "bg-blue-100 text-blue-800" },
  { value: "PREPARING", label: "Preparing", color: "bg-orange-100 text-orange-800" },
  { value: "READY", label: "Ready", color: "bg-green-100 text-green-800" },
  { value: "SERVED", label: "Served", color: "bg-gray-100 text-gray-800" },
  { value: "PAID", label: "PAID", color: "bg-gray-100 text-gray-800" },
];

const AdminKitchen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchSingleOrder = async (orderId: number) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/orders/${orderId}`);
      const normalized = {
        ...res.data,
        items: Array.isArray(res.data.items) ? res.data.items : [],
      };
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? normalized : o))
      );
    } catch (err) {
      console.error("Error fetching single order:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/orders/kitchen");
      const normalized = res.data.map((o: any) => ({
        ...o,
        items: Array.isArray(o.items) ? o.items : [],
      }));
      setOrders(normalized);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await axios.put(`http://localhost:3000/api/orders/status/${orderId}`, {
        status: newStatus,
      });
      await fetchSingleOrder(orderId);
      showToast(`Order #${orderId} updated to ${newStatus}`, { type: "success" });
    } catch (err) {
      console.error("Error updating order status:", err);
      showToast("Failed to update order status", { type: "error" });
    }
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find((o) => o.value === status);
    return option?.color || "bg-gray-100 text-gray-800";
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    socket.emit("join_room", { userType: "admin" });

    socket.on("newOrder", (newOrder: Order) => {
      setOrders((prev) => [
        { ...newOrder, items: Array.isArray(newOrder.items) ? newOrder.items : [] },
        ...prev,
      ]);
    });

    socket.on("orderStatusUpdate", (updatedOrder: Order) => {
      if (!updatedOrder.items || updatedOrder.items.length === 0) {
        fetchSingleOrder(updatedOrder.id);
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === updatedOrder.id
              ? { ...updatedOrder, items: Array.isArray(updatedOrder.items) ? updatedOrder.items : [] }
              : o
          )
        );
      }
    });

    fetchOrders();

    return () => {
      socket.off("newOrder");
      socket.off("orderStatusUpdate");
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto relative">
      <Toast />
      
      {/* Header */}
      <div className="bg-white px-4 py-6 flex items-center justify-between shadow-sm">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Admin Orders</h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage all orders</p>
        </div>
        <div className="bg-green-100 px-3 py-1 rounded-full">
          <span className="text-green-800 text-sm font-medium">🟢 Live</span>
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 py-6 space-y-4 pb-20">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Orders</h3>
            <p className="text-gray-500">New orders will appear here automatically</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-white shadow-sm border overflow-hidden"
            >
              <div className="px-4 py-3 border-b bg-gray-50 flex justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500">
                    Table {order.tableId} • {formatTime(order.createdAt)}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(order.status)}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="px-4 py-3">
                <div className="space-y-2 mb-3">
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {item.menu.name} ×{item.quantity}
                        </p>
                        <span className="text-xs text-gray-500 capitalize">
                          {item.menu.category.join(", ")}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Loading items...</p>
                  )}
                </div>

                {/* Status Progression */}
                <div className="flex gap-2">
                  {statusOptions
                    .filter((option) => {
                      if (order.status === "PENDING") return option.value === "CONFIRMED";
                      if (order.status === "CONFIRMED") return option.value === "PREPARING";
                      if (order.status === "PREPARING") return option.value === "READY";
                      if (order.status === "READY") return option.value === "SERVED";
                      if (order.status === "SERVED") return option.value === "PAID";
                      return false;
                    })
                    .map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateOrderStatus(order.id, option.value)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-medium"
                      >
                        {option.label}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default AdminKitchen;
