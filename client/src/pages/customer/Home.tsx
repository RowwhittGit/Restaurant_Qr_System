import { useState, useEffect } from "react"
import { Search, Heart, Home, User, MessageCircle, Plus, Menu } from "lucide-react"
import { IoAddCircleSharp } from "react-icons/io5";
import axios from "axios"
import { useOrderStore } from "../../stores/orderStore";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import Toast, { useToast } from "../../components/Toast";

interface FoodItem {
  id: number
  image: string
  name: string
  category: string[]
  price: number
}

const categories = ["All", "Pizza", "Burger", "Laphing", "Platter", "Momo"]

export default function HomePage() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [displayItems, setDisplayItems] = useState<FoodItem[]>([])
  
  // Zustand stores for placing orders
  const { addToOrder } = useOrderStore();
  const { showToast } = useToast(); 
  
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/menu/")
        setFoodItems(response.data.data)
        setDisplayItems(response.data.data)
        console.log(response.data);
        
      } catch (error) {
        console.error("Error fetching food items:", error)
        showToast("Failed to load food items", { type: "error" });
      }
    }
    fetchFoodItems()
  }, [])
  
  useEffect(() => {
    let filtered: FoodItem[] = []
    if (searchTerm.trim() !== "") {
      // Search across all categories
      filtered = foodItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } else if (activeCategory !== "All") {
      // Filter by category
      filtered = foodItems.filter(item =>
        item.category.map(c => c.toLowerCase()).includes(activeCategory.toLowerCase())
      )
    } else {
      filtered = foodItems
    }
    setDisplayItems(filtered)
  }, [foodItems, searchTerm, activeCategory])
  
  const navigate: NavigateFunction = useNavigate();

  // Function to add to the cart and notify
  const addItemToCart = (item: FoodItem) => {
    try {
      // Add item to order using Zustand store
      addToOrder(item);
      
      // Show success toast notification
      showToast(`${item.name} added to cart!`, { 
        type: "success",
        toastOptions: {
          position: "top-right",
          autoClose: 2000,
        }
      });
      
    } catch (error) {
      console.error("Error adding item to cart:", error);
      
      // Show error toast notification
      showToast("Failed to add item to cart", { 
        type: "error",
        toastOptions: {
          position: "top-right",
          autoClose: 3000,
        }
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto relative">
      {/* Toast Container */}
      <Toast />
      
      {/* Header */}
      <div className="bg-white px-4 py-6 flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Bhatti foods</h1>
          <p className="text-sm text-gray-600 mt-1">Order your favourite food!</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img src="https://t3.ftcdn.net/jpg/07/24/59/76/360_F_724597608_pmo5BsVumFcFyHJKlASG2Y2KpkkfiYUU.jpg" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-2">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-4 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            placeholder="Search"
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
                <div className="aspect-square relative overflow-hidden">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-gray-500 mb-2 capitalize">{item.category.join(", ")}</p>

                  <div className="flex items-center justify-start">
                    <h1 className="">Rs. {item.price}</h1>
                    <button 
                      className="text-red-500 ml-8 cursor-pointer hover:text-red-600 transition-colors" 
                      onClick={() => addItemToCart(item)} // Pass the item as parameter
                    >
                      <IoAddCircleSharp className="text-red-500 text-5xl" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center col-span-2 text-gray-500">No items found</p>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-red-500 px-4 py-3">
        <div className="flex items-center justify-around">
          <button className="text-white hover:bg-red-600 p-2 rounded">
            <Home className="h-6 w-6" />
          </button>
          <button className="text-white hover:bg-red-600 p-2 rounded">
            <User className="h-6 w-6" />
          </button>
          <button className="text-white hover:bg-red-600 p-2 rounded">
            <MessageCircle className="h-6 w-6" />
          </button>
          <button className="text-white hover:bg-red-600 p-2 rounded" onClick={() => navigate("/orders")}>
            <Heart className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4">
        <button className="bg-red-500 hover:bg-red-600 text-white rounded-full h-14 w-14 shadow-lg flex items-center justify-center">
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Debug indicator */}
      <div className="fixed bottom-4 right-4 bg-black/20 text-white text-xs px-2 py-1 rounded pointer-events-none">
        72 x 72
      </div>
    </div>
  )
}