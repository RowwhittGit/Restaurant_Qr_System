import { IoAddCircleSharp, IoRemoveCircleSharp, IoTrashOutline } from "react-icons/io5";
import { IoArrowBackOutline } from "react-icons/io5";
import { useOrderStore } from "../stores/orderStore";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import Toast, { useToast } from "../components/Toast";

interface FoodItem {
  id: number
  image: string
  name: string
  category: string[]
  price: number
  quantity: number // Added quantity property for order items
}

export default function Orders() {
  const { orders, increaseQuantity, decreaseQuantity, removeFromOrder, placeOrder } = useOrderStore();
  const { showToast } = useToast(); // Fixed: Import from useToast hook
  
  console.log("this is the order", orders);
  
  const totalPrice = orders.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Navigation
  const navigate: NavigateFunction = useNavigate()

  // Functions for add, remove, increase, decrease, and place order
  const increase = (item: FoodItem) => { // Fixed: Changed parameter type from FoodItem[] to FoodItem
    try {
      increaseQuantity(item.id);
      
      // Show success toast notification
      showToast(`${item.name} quantity increased!`, { 
        type: "success",
        toastOptions: {
          position: "top-right",
          autoClose: 1500,
        }
      });
    } catch (error) {
      console.error("Error increasing quantity:", error);
      showToast("Failed to increase quantity", { 
        type: "error",
        toastOptions: {
          position: "top-right",
          autoClose: 2000,
        }
      });
    }
  }

  const decrease = (item: FoodItem) => {
    try {
      decreaseQuantity(item.id);
      
      // Show success toast notification
      showToast(`${item.name} quantity decreased!`, { 
        type: "info",
        toastOptions: {
          position: "top-right",
          autoClose: 1500,
        }
      });
    } catch (error) {
      console.error("Error decreasing quantity:", error);
      showToast("Failed to decrease quantity", { 
        type: "error",
        toastOptions: {
          position: "top-right",
          autoClose: 2000,
        }
      });
    }
  }

  const removeItem = (item: FoodItem) => {
    try {
      removeFromOrder(item.id);
      
      // Show warning toast notification
      showToast(`${item.name} removed from cart!`, { 
        type: "warning",
        toastOptions: {
          position: "top-right",
          autoClose: 2000,
        }
      });
    } catch (error) {
      console.error("Error removing item:", error);
      showToast("Failed to remove item", { 
        type: "error",
        toastOptions: {
          position: "top-right",
          autoClose: 2000,
        }
      });
    }
  }

  const handlePlaceOrder = () => {
    try {
      if (orders.length === 0) {
        showToast("Your cart is empty!", { 
          type: "warning",
          toastOptions: {
            position: "top-right",
            autoClose: 2000,
          }
        });
        return;
      }

      placeOrder();
      
      // Show success toast notification
      showToast(`Order placed successfully! Total: Rs. ${totalPrice}/-`, { 
        type: "success",
        toastOptions: {
          position: "top-right",
          autoClose: 3000,
        }
      });

      // Navigate back or to order confirmation page
      setTimeout(() => {
        navigate("/more");
      }, 2000);

    } catch (error) {
      console.error("Error placing order:", error);
      showToast("Failed to place order", { 
        type: "error",
        toastOptions: {
          position: "top-right",
          autoClose: 3000,
        }
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto pb-28">
      {/* Toast Container */}
      <Toast />
      
      {/* Header */}
      <div className="bg-white px-4 py-6 shadow-sm flex gap-5 items-center">
        <button className="bg-red-500 rounded-full w-10 flex justify-center hover:bg-red-600 transition-colors" onClick={() => navigate("/more")}>
          <IoArrowBackOutline className="h-10 w-8 text-white"/>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Order Items</h1>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        {orders.length > 0 ? (
          orders.map((item) => (
            <div key={item.id} className="flex items-center bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Image */}
              <div className="w-24 h-24 flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              {/* Details */}
              <div className="flex-1 p-3">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.name}</h3>
                <p className="text-green-600 font-bold">Rs. {item.price}/-</p>

                {/* Quantity Controls */}
                <div className="flex items-center mt-2 gap-2">
                  <button 
                    onClick={() => increase(item)} // Fixed: Pass item instead of item.id and use custom function
                    className="hover:scale-110 transition-transform"
                  >
                    <IoAddCircleSharp className="text-green-500 text-2xl" />
                  </button>
                  <span className="px-3 text-gray-800 font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => decrease(item)} // Fixed: Use custom decrease function
                    className="hover:scale-110 transition-transform"
                  >
                    <IoRemoveCircleSharp className="text-green-500 text-2xl" />
                  </button>
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => removeItem(item)} // Fixed: Use custom remove function
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
              onClick={() => navigate("/more")}
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
            onClick={handlePlaceOrder} // Fixed: Use custom place order function
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl shadow-md transition-colors"
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
}