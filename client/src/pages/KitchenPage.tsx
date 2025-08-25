import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';

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

const KitchenPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Status options for kitchen
  const statusOptions = [
    { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'PREPARING', label: 'Preparing', color: 'bg-orange-100 text-orange-800' },
    { value: 'READY', label: 'Ready', color: 'bg-green-100 text-green-800' },
    { value: 'SERVED', label: 'Served', color: 'bg-gray-100 text-gray-800' },
  ];

  // Join kitchen room on mount
  useEffect(() => {
    socket.emit("join_room", { userType: "kitchen" });
    
    // Listen for new orders
    socket.on("newOrder", (newOrder: Order) => {
      console.log("New order received:", newOrder);
      setOrders(prev => [newOrder, ...prev]);
      
      // Show notification
      if (Notification.permission === 'granted') {
        new Notification(`New Order #${newOrder.id}`, {
          body: `Table ${newOrder.tableId} - ${newOrder.totalItems} items`,
          icon: '/kitchen-icon.png'
        });
      }
    });

    // Listen for order status updates
    socket.on("orderStatusUpdate", (updatedOrder: Order) => {
      console.log("Order status updated:", updatedOrder);
      setOrders(prev => prev.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      ));
    });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Fetch existing orders
    fetchOrders();

    return () => {
      socket.off("newOrder");
      socket.off("orderStatusUpdate");
    };
  }, []);

  const fetchOrders = async () => {
    try {
      // You'll need to create this endpoint to get all active orders
      const response = await axios.get("http://localhost:3000/api/orders/active");
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await axios.patch(`http://localhost:3000/api/orders/${orderId}/status`, {
        status: newStatus
      });
      // The real-time update will come through socket
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="bg-orange-500 rounded-lg p-2 mr-3">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kitchen Dashboard</h1>
                <p className="text-sm text-gray-600">Manage incoming orders in real-time</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-green-100 px-3 py-1 rounded-full">
                <span className="text-green-800 text-sm font-medium">
                  🟢 Live Connected
                </span>
              </div>
              <span className="text-gray-600">{orders.length} Active Orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Orders</h3>
            <p className="text-gray-500">New orders will appear here automatically</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Table {order.tableId} • {formatTime(order.createdAt)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <div className="space-y-3 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.menu.name}</p>
                          <p className="text-sm text-gray-500 capitalize">
                            {item.menu.category.join(', ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                            ×{item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium text-gray-900">Total Items:</span>
                      <span className="font-bold">{order.totalItems}</span>
                    </div>
                    
                    {/* Status Update Buttons */}
                    <div className="flex gap-2">
                      {statusOptions
                        .filter(option => {
                          // Show next logical status options
                          if (order.status === 'PENDING') return ['CONFIRMED'].includes(option.value);
                          if (order.status === 'CONFIRMED') return ['PREPARING'].includes(option.value);
                          if (order.status === 'PREPARING') return ['READY'].includes(option.value);
                          if (order.status === 'READY') return ['SERVED'].includes(option.value);
                          return false;
                        })
                        .map((option) => (
                          <button
                            key={option.value}
                            onClick={() => updateOrderStatus(order.id, option.value)}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                          >
                            {option.label}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenPage;