import { useState, useEffect } from "react"
import { Search, Heart, Plus, Menu } from "lucide-react"
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import axios, { AxiosError } from "axios"
import { useNavigate } from "react-router-dom";
import Toast, { useToast } from "../../components/Toast";
import BottomNav from "../../components/BottomNav";
import baseApi from "../../utils/api";

interface FoodItem {
  id: number
  image: string
  name: string
  category: string[]
  price: number
  isAvailable: boolean // Add this field
}

const categories = ["All", "Pizza", "Burger", "Laphing", "Platter", "Momo"]

export default function AdminMenu() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [displayItems, setDisplayItems] = useState<FoodItem[]>([])
  const [dropdownOpen, setDropdownOpen] = useState<Boolean>(false);
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [customerView, setCustomerView] = useState<boolean>(false);
  
  const { showToast } = useToast(); 
  
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await baseApi.get("/menu/adminMenu" , {
        withCredentials: true,
      })
        setFoodItems(response.data.data)
        setDisplayItems(response.data.data)
        console.log(response.data);
        
      } catch (error) {
        console.error("Error fetching food items:", error)
        showToast("Failed to load food items", { type: "error" });
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401) {
        navigate('/login');
      }
      }
    }
    fetchFoodItems()
  }, [])
  
  useEffect(() => {
    let filtered: FoodItem[] = foodItems;
    
    // First, apply customerView filter if active
    if (customerView) {
      filtered = filtered.filter(item => item.isAvailable);
    }
    
    // Then apply search/category filters on top of customerView filter
    if (searchTerm.trim() !== "") {
      // Search across the already filtered items
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (activeCategory !== "All") {
      // Filter by category on the already filtered items
      filtered = filtered.filter(item =>
        item.category.map(c => c.toLowerCase()).includes(activeCategory.toLowerCase())
      );
    }
    
    setDisplayItems(filtered);
  }, [foodItems, searchTerm, activeCategory, customerView])
  
  const navigate = useNavigate();

  // Function to toggle menu item visibility
  const toggleMenuItemVisibility = async (item: FoodItem) => {
    setLoadingStates(prev => ({ ...prev, [item.id]: true }));
    
    try {
      console.log("Toggling visibility for item:", item);
      
      // Make PATCH request to toggle availability
      //mock api endpoint
       await axios.patch(`http://localhost:3000/api/menu/${item.id}/availability/`);
      
      // Update local state with the toggled availability
      setFoodItems(prevItems => 
        prevItems.map(i => 
          i.id === item.id 
            ? { ...i, isAvailable: !i.isAvailable } 
            : i
        )
      );
      
      // Show success toast notification
      const newStatus = !item.isAvailable ? "shown" : "hidden";
      showToast(`${item.name} is now ${newStatus}`, { 
        type: "success",
        toastOptions: {
          position: "top-right",
          autoClose: 2000,
        }
      });
      
    } catch (error) {
      console.error("Error toggling menu item visibility:", error);
      
      // Show error toast notification
      showToast("Failed to update menu item visibility", { 
        type: "error",
        toastOptions: {
          position: "top-right",
          autoClose: 3000,
        }
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [item.id]: false }));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto relative">
      {/* Toast Container */}
      <Toast />
      
      {/* Header */}
      <div className="bg-white px-4 py-6 flex items-center justify-between shadow-sm">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Bhatti foods</h1>
          <p className="text-sm text-gray-600 mt-1">
            {customerView ? "Customer view - Available items only" : "Manage your restaurant"}
          </p>
        </div>
        <div className="flex items-center gap-3 relative">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
            <img src="https://t3.ftcdn.net/jpg/07/24/59/76/360_F_724597608_pmo5BsVumFcFyHJKlASG2Y2KpkkfiYUU.jpg" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button 
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-2 transition-all duration-200 hover:shadow-md active:scale-95" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Dropdown Menu */}
          <div className={`absolute top-14 right-0 bg-white shadow-xl rounded-xl overflow-hidden z-50 min-w-[180px] border border-gray-100 transition-all duration-300 transform origin-top-right ${
            dropdownOpen 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }`}>
            <div className="py-2">
              <button 
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left text-gray-700 hover:text-gray-900 transition-colors duration-150"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/admin/menu/create");
                }}
              >
                <Plus className="h-4 w-4 text-green-500" />
                <span className="font-medium">Create Menu</span>
              </button>
              
              <button 
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left text-gray-700 hover:text-gray-900 transition-colors duration-150"
                onClick={() => {
                  setDropdownOpen(false);
                  setCustomerView(!customerView);
                }}
              >
                <IoEyeOutline className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{customerView ? "Admin View" : "Customer View"}</span>
              </button>
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <button 
                className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 w-full text-left text-gray-700 hover:text-red-600 transition-colors duration-150"
                onClick={() => {
                  setDropdownOpen(false);
                  // Add logout logic here
                  console.log("Logout clicked");
                }}
              >
                <Heart className="h-4 w-4 text-red-500" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-4 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            placeholder="Search menu items"
            value={searchTerm}
            className="w-full pl-10 bg-gray-100 border-0 rounded-lg h-12 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      {searchTerm.trim() === "" && (
        <div className="px-4 py-4 bg-white">
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button 
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  activeCategory === category
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Food Grid */}
      <div className="px-4 pb-20">
        <div className="grid grid-cols-2 gap-4">
          {displayItems.length > 0 ? (
            displayItems.map((item) => (
              <div key={item.id} className="rounded-2xl overflow-hidden shadow-sm bg-white">
                {/* Image with blur overlay for unavailable items */}
                <div className="aspect-square relative overflow-hidden" onClick={() => navigate(`/admin/menu/update/${item.id}`)}>
                  <img 
                    src={item.image || "/placeholder.svg"} 
                    alt={item.name} 
                    className={`w-full h-full object-cover ${!item.isAvailable ? 'filter blur-sm opacity-60' : ''}`}
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <span className="text-white font-bold text-xs bg-black bg-opacity-60 px-2 py-1 rounded">
                        Unavailable
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-gray-500 mb-2 capitalize">{item.category.join(", ")}</p>

                  <div className="flex items-center justify-between">
                    <h1 className="text-gray-900 font-medium">Rs. {item.price}</h1>
                    {!customerView && (
                      <button 
                        className={`p-1 rounded-full transition-colors ${
                          item.isAvailable 
                            ? "text-green-600 hover:bg-green-100" 
                            : "text-gray-400 hover:bg-gray-100"
                        }`}
                        onClick={() => toggleMenuItemVisibility(item)}
                        disabled={loadingStates[item.id]}
                        aria-label={item.isAvailable ? "Hide menu item" : "Show menu item"}
                      >
                        {loadingStates[item.id] ? (
                          <div className="w-5 h-5 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
                        ) : item.isAvailable ? (
                          <IoEyeOutline className="text-xl" />
                        ) : (
                          <IoEyeOffOutline className="text-xl" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center col-span-2 text-gray-500">
              {customerView ? "No available menu items found" : "No menu items found"}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}