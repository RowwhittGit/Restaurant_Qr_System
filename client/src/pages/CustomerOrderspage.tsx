// CustomerOrdersPage.jsx
import { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:3000"); // backend server

export default function CustomerOrdersPage({ tableId }) {
  const [cart, setCart] = useState([
    { name: "Grilled Chicken Burger", price: 16.75, quantity: 3 },
    { name: "Classic Margherita Pizza", price: 14.99, quantity: 1 },
  ]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Join the table room when mounted
  useEffect(() => {
    socket.emit("join_room", { userType: "customer", tableId });

    // Listen for order confirmation
    socket.on("orderPlaced", (order) => {
      alert(`✅ Order #${order.id} placed successfully!`);
      console.log("Order confirmed:", order);
    });

    return () => {
      socket.off("orderPlaced");
    };
  }, [tableId]);

  // Recalculate totals
  useEffect(() => {
    const items = cart.reduce((sum, i) => sum + i.quantity, 0);
    const price = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    setTotalItems(items);
    setTotalPrice(price);
  }, [cart]);

  const placeOrder = async () => {
    try {
      const res = await axios.post("http://localhost:3000/api/orders", {
        tableId,
        items: cart,
        totalItems,
        totalPrice,
      });

      console.log("Order sent:", res.data);
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Order Items</h2>

      {cart.map((item, index) => (
        <div key={index} className="flex items-center justify-between mb-2 border-b pb-2">
          <span>{item.name}</span>
          <span className="text-green-600">Rs. {item.price.toFixed(2)}/-</span>
          <span className="font-bold">{item.quantity}</span>
        </div>
      ))}

      <div className="mt-4">
        <p>Total Items: {totalItems}</p>
        <p className="text-green-600">Total Price: Rs. {totalPrice.toFixed(2)}/-</p>
      </div>

      <button
        onClick={placeOrder}
        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
      >
        Place Order
      </button>
    </div>
  );
}
