
import { useEffect, useState } from "react"
import axios from "axios"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts"
import BottomNav from "../../components/BottomNav"
import { Menu } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { FaStar } from "react-icons/fa"
interface BestSeller {
  menuId: number
  name: string
  totalSold: number
  totalRevenue: number
}

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#6366f1"]

function Chart3() {
  const [apiData, setApiData] = useState<BestSeller[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<BestSeller[]>(
          "https://dummyjson.com/c/a84d-e050-42c4-b297" // ✅ Your dummyjson link
        )
        console.log("Best sellers data:", response.data)
        setApiData(response.data)
      } catch (error) {
        console.error("Error fetching best sellers:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <p className="text-center text-gray-500">Loading...</p>
  if (!apiData.length) return <p className="text-center text-gray-500">No data available</p>

  // Sort by most sold
  const sortedData = [...apiData].sort((a, b) => b.totalSold - a.totalSold)

  return (
    <div className="p-4 rounded-2xl bg-gray-50 w-full min-h-screen max-w-sm mx-auto shadow-2xl relative">
      {/* Header */}
      <div className="bg-transparent py-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 font-serif flex items-center gap-2">
          <FaStar className="text-yellow-500" /> Weekly Best Sellers
        </h1>
        <div className="relative">
          <button
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-2 transition-all duration-200 hover:shadow-md active:scale-95"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <Menu className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
              <button
                onClick={() => navigate("/weekly-graph")}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
              >
                Back to Weekly Graph
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="relative h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sortedData}
            margin={{ top: 20, right: 30, left: 60, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Bar dataKey="totalSold" barSize={30} radius={[0, 10, 10, 0]}>
              {sortedData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data List */}
      <div className="mt-6 space-y-3">
        {sortedData.map((item, index) => (
          <div
            key={item.menuId}
            className="flex justify-between items-center bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></span>
              <span className="text-gray-700 text-sm font-medium">{item.name}</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">
              {item.totalSold} Sold
            </span>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}

export default Chart3
