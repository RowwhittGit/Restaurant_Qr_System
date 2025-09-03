import React from "react";
import { Home } from "lucide-react";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const CustomerNav: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-red-500 px-8 py-2 rounded-md shadow-2xl">
        <div className="flex items-center justify-around">
          <button
            className="text-white hover:bg-red-600 p-3 rounded-lg flex items-center gap-3 transition-colors"
            onClick={() => navigate("/")}
          >
            <Home className="h-7 w-7" />
            <span className="text-sm font-medium">Home</span>
          </button>
          <button
            className="text-white hover:bg-red-600 p-3 rounded-lg flex items-center gap-3 transition-colors"
            onClick={() => navigate("/orders")}
          >
            <MdOutlineRestaurantMenu className="h-7 w-7" />
            <span className="text-sm font-medium">Orders</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerNav;