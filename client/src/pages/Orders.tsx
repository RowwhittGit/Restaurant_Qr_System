import { IoAddCircleSharp, IoRemoveCircleSharp, IoTrashOutline } from "react-icons/io5";
import { IoArrowBackOutline } from "react-icons/io5";
import { useOrderStore } from "../stores/orderStore";
import { useNavigate, type NavigateFunction } from "react-router-dom";

export default function Orders() {
  const { orders, increaseQuantity, decreaseQuantity, removeFromOrder, placeOrder } = useOrderStore();
  
  console.log("this is the order", orders);
  

  const totalPrice = orders.reduce((sum, item) => sum + item.price * item.quantity, 0);

  //navigation
  const navigate: NavigateFunction = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto pb-28">
      {/* Header */}
      <div className="bg-white px-4 py-6 shadow-sm flex gap-5 items-center">
        <button className="bg-red-500 rounded-full w-10 flex justify-center" onClick={() => navigate("/more")}>
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
                  <button onClick={() => increaseQuantity(item.id)}>
                    <IoAddCircleSharp className="text-green-500 text-2xl" />
                  </button>
                  <span className="px-3 text-gray-800 font-medium">{item.quantity}</span>
                  <button onClick={() => decreaseQuantity(item.id)}>
                    <IoRemoveCircleSharp className="text-green-500 text-2xl" />
                  </button>
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => removeFromOrder(item.id)}
                className="p-2 text-red-500 hover:text-red-600"
              >
                <IoTrashOutline className="text-xl" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No items in your order</p>
        )}
      </div>

      {/* Order Summary */}
      {orders.length > 0 && (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white shadow-lg p-4 rounded-t-2xl">
          <div className="flex justify-between mb-2">
            <span className="text-gray-700 font-medium">Total Items:</span>
            <span className="font-bold">{orders.length}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-700 font-medium">Total Price:</span>
            <span className="font-bold text-green-600">Rs. {totalPrice}/-</span>
          </div>
          <button
            onClick={placeOrder}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl shadow-md"
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
}
