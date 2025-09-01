import React from "react";
import { Home } from "lucide-react";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { LuSquareMenu } from "react-icons/lu";
import { MdOutlineFastfood } from "react-icons/md";

const BottomNav: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div >
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-red-500 px-4 py-3 rounded-md">
        <div className="flex items-center justify-around">
          <button
            className="text-white hover:bg-red-600 p-2 rounded"
            onClick={() => navigate("/admin")}
          >
            <Home className="h-6 w-6" />
          </button>
          <button
            className="text-white hover:bg-red-600 p-2 rounded"
            onClick={() => navigate("/admin/menu")}
          >
            <LuSquareMenu className="h-6 w-6" />
          </button>
          <button
            className="text-white hover:bg-red-600 p-2 rounded"
            onClick={() => navigate("/admin/kitchen")}
          >
            <MdOutlineRestaurantMenu className="h-6 w-6" />
          </button>
          <button className="text-white hover:bg-red-600 p-2 rounded" onClick={() => navigate("/admin/orders")}>
            <MdOutlineFastfood className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;