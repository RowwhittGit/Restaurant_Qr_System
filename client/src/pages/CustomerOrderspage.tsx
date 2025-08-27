import { IoAddCircleSharp, IoRemoveCircleSharp, IoTrashOutline } from "react-icons/io5"
import { IoArrowBackOutline, IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5"
import { useOrderStore } from "../stores/orderStore"
import { useNavigate, type NavigateFunction } from "react-router-dom"
import Toast, { useToast } from "../components/Toast"
import io from "socket.io-client"
import { useEffect, useState } from "react"
import axios from "axios"

interface FoodItem {
  id: number
  image: string
  name: string
  category: string[]
  price: number
  quantity: number
}

interface ActiveOrderItem {
  name: string
  quantity: number
  price: number
  menu: {
    price: number
  }
}

interface ActiveOrder {
  id: number
  tableId: number
  items: ActiveOrderItem[]
  status: string
  totalPrice: number
  createdAt: string
}

// ✅ connect socket outside component so it persists
const socket = io("http://localhost:3000") // replace with your backend URL

export default function CustomerOrder() {
  const { orders, increaseQuantity, decreaseQuantity, removeFromOrder, clearOrders } = useOrderStore()
  const { showToast } = useToast()

  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([])
  const [showActiveOrders, setShowActiveOrders] = useState(false)
  const [loadingActiveOrders, setLoadingActiveOrders] = useState(false)

  const navigate: NavigateFunction = useNavigate()

  const totalPrice = orders.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const fetchActiveOrders = async () => {
    try {
      setLoadingActiveOrders(true)
      const tableId = 1 // replace with real tableId from QR
      const response = await axios.get(`http://localhost:3000/api/orders/table/${tableId}`)
      setActiveOrders(response.data)
    } catch (error) {
      console.error("Error fetching active orders:", error)
      showToast("Failed to load active orders", {
        type: "error",
        toastOptions: { position: "top-right", autoClose: 2000 },
      })
    } finally {
      setLoadingActiveOrders(false)
    }
  }

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { emoji: "⏳", color: "text-yellow-600", bg: "bg-yellow-50" }
      case "preparing":
        return { emoji: "👨‍🍳", color: "text-blue-600", bg: "bg-blue-50" }
      case "ready":
        return { emoji: "✅", color: "text-green-600", bg: "bg-green-50" }
      case "delivered":
        return { emoji: "🍽️", color: "text-gray-600", bg: "bg-gray-50" }
      default:
        return { emoji: "⏳", color: "text-yellow-600", bg: "bg-yellow-50" }
    }
  }

  // ✅ Join as customer when page loads
  useEffect(() => {
    const tableId = 1 // replace with real tableId from QR
    socket.emit("join_room", { userType: "customer", tableId })

    fetchActiveOrders()

    // Listen for order confirmation
    socket.on("orderPlaced", (order) => {
      showToast(`✅ Order #${order.id} placed successfully!`, {
        type: "success",
        toastOptions: { position: "top-right", autoClose: 2000 },
      })
      console.log("Order confirmed from server:", order)

      // Clear local cart after confirmation
      clearOrders()

      fetchActiveOrders()

    })

    return () => {
      socket.off("orderPlaced")
    }
  }, [clearOrders])

  // 🔼 Quantity handlers
  const increase = (item: FoodItem) => increaseQuantity(item.id)
  const decrease = (item: FoodItem) => decreaseQuantity(item.id)
  const removeItem = (item: FoodItem) => removeFromOrder(item.id)

  // ✅ Place Order → send to backend
  const handlePlaceOrder = async () => {
    try {
      if (orders.length === 0) {
        showToast("Your cart is empty!", {
          type: "warning",
          toastOptions: { position: "top-right", autoClose: 2000 },
        })
        return
      }

      // Build correct payload for backend
      const payload = {
        tableId: 1, // later you can make this dynamic
        items: orders.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          menuId: item.id,
        })),
        totalItems: orders.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: orders.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }

      // Send to backend
      await axios.post("http://localhost:3000/api/orders/", payload)

      showToast(`Order placed successfully! Total: Rs. ${payload.totalPrice}/-`, {
        type: "success",
        toastOptions: { position: "top-right", autoClose: 3000 },
      })
    } catch (error) {
      console.error("Error placing order:", error)
      showToast("Failed to place order", {
        type: "error",
        toastOptions: { position: "top-right", autoClose: 3000 },
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto pb-28">
      <Toast />

      {/* Header */}
      <div className="bg-white px-4 py-6 shadow-sm flex gap-5 items-center">
        <button
          className="bg-red-500 rounded-full w-10 flex justify-center hover:bg-red-600 transition-colors"
          onClick={() => navigate("/")}
        >
          <IoArrowBackOutline className="h-10 w-8 text-white" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Order Items</h1>
      </div>

      <div className="mx-4 mt-4 mb-2">
        <button
          onClick={() => {
            setShowActiveOrders(!showActiveOrders)
            if (!showActiveOrders) fetchActiveOrders()
          }}
          className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-gray-900">Active Orders</span>
            {activeOrders.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{activeOrders.length}</span>
            )}
          </div>
          {showActiveOrders ? (
            <IoChevronUpOutline className="text-gray-500 text-xl" />
          ) : (
            <IoChevronDownOutline className="text-gray-500 text-xl" />
          )}
        </button>

        {/* Active Orders Content */}
        {showActiveOrders && (
          <div className="mt-2 bg-white rounded-xl shadow-sm overflow-hidden">
            {loadingActiveOrders ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading active orders...
              </div>
            ) : activeOrders.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {activeOrders.map((order) => {
                  const statusDisplay = getStatusDisplay(order.status)
                  return (
                    <div key={order.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.id} (Table {order.tableId})
                        </h3>
                        <div className={`px-3 py-1 rounded-full ${statusDisplay.bg} flex items-center gap-1`}>
                          <span className="text-sm">{statusDisplay.emoji}</span>
                          <span className={`text-sm font-medium ${statusDisplay.color}`}>{order.status}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.name} (x{item.quantity})
                            </span>
                            <span className="text-gray-900 font-medium">Rs. {item.menu.price * item.quantity}/-</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</span>
                        <span className="font-bold text-green-600">Total: Rs. {order.totalPrice}/-</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <span className="text-2xl mb-2 block">🍽️</span>
                No active orders found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        {orders.length > 0 ? (
          orders.map((item) => (
            <div key={item.id} className="flex items-center bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="w-24 h-24 flex-shrink-0">
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 p-3">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.name}</h3>
                <p className="text-green-600 font-bold">Rs. {item.price}/-</p>

                {/* Quantity Controls */}
                <div className="flex items-center mt-2 gap-2">
                  <button onClick={() => increase(item)} className="hover:scale-110 transition-transform">
                    <IoAddCircleSharp className="text-green-500 text-2xl" />
                  </button>
                  <span className="px-3 text-gray-800 font-medium">{item.quantity}</span>
                  <button onClick={() => decrease(item)} className="hover:scale-110 transition-transform">
                    <IoRemoveCircleSharp className="text-green-500 text-2xl" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => removeItem(item)}
                className="p-2 text-red-500 hover:text-red-600 hover:scale-110 transition-all"
              >
                <IoTrashOutline className="text-xl" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items in your order</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Start Ordering
            </button>
          </div>
        )}
      </div>

      {/* Order Summary */}
      {orders.length > 0 && (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white shadow-lg p-4 rounded-t-2xl">
          <div className="flex justify-between mb-2">
            <span className="text-gray-700 font-medium">Total Items:</span>
            <span className="font-bold">{orders.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-700 font-medium">Total Price:</span>
            <span className="font-bold text-green-600">Rs. {totalPrice}/-</span>
          </div>
          <button
            onClick={handlePlaceOrder}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl shadow-md transition-colors"
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  )
}
