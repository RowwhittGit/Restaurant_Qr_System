"use client"

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
import { FaChartPie, FaCalendarWeek, FaStar } from "react-icons/fa"

interface DataItem {
  day: string
  date: string
  totalOrders: number
  totalRevenue: number
}

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#6366f1", "#ec4899", "#14b8a6"]

function Chart2() {
  const [chartType, setChartType] = useState<"orders" | "revenue">("revenue")
  const [apiData, setApiData] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<DataItem[]>(
          "https://dummyjson.com/c/0f03-6bf6-407d-b062"
        )
        console.log("Weekly sales data:", response.data)
        setApiData(response.data)
      } catch (error) {
        console.error("Error fetching weekly sales data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <p className="text-center text-gray-500">Loading...</p>
  if (!apiData.length) return <p className="text-center text-gray-500">No data available</p>

  // Prepare chart data
  const chartData = apiData.map((item) => ({
    name: item.day,
    orders: item.totalOrders,
    revenue: item.totalRevenue,
  }))

  // Handle navigation + close menu
  const handleNavigate = (path: string) => {
    navigate(path)
    setMenuOpen(false)
  }

  return (
    <div className="p-4 rounded-2xl bg-gray-50 w-full min-h-screen max-w-sm mx-auto shadow-2xl relative">
      {/* 🔹 Static Header */}
      <div className="bg-transparent py-6 flex items-center justify-between gap-4 relative">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Bhatti foods</h1>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
          <img
            src="https://t3.ftcdn.net/jpg/07/24/59/76/360_F_724597608_pmo5BsVumFcFyHJKlASG2Y2KpkkfiYUU.jpg"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative">
          <button 
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-2 transition-all duration-200 hover:shadow-md active:scale-95" 
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* 🔽 Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
              <button
                onClick={() => handleNavigate("/today-sales")}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
              >
                <FaChartPie className="text-red-500" /> Today&apos;s Sales
              </button>
              <button
                onClick={() => handleNavigate("/weekly-graph")}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
              >
                <FaCalendarWeek className="text-blue-500" /> Weekly Graph
              </button>
              <button
                onClick={() => handleNavigate("/best-sellers")}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
              >
                <FaStar className="text-yellow-500" /> Best Sellers
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
        <div>
          <h2 className="font-bold text-lg text-gray-900">
            {chartType === "orders" ? "Orders (7 days)" : "Revenue (7 days)"}
          </h2>
          <p className="text-sm text-gray-500">Weekly performance overview</p>
        </div>
        <button
          onClick={() => setChartType(chartType === "orders" ? "revenue" : "orders")}
          className="mt-2 sm:mt-0 px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm transition-all active:scale-95"
        >
          Switch to {chartType === "orders" ? "Revenue" : "Orders"}
        </button>
      </div>

      {/* Bar Chart */}
      <div className="relative h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey={chartType === "orders" ? "orders" : "revenue"}
              radius={[10, 10, 0, 0]}
              barSize={35}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data List Below */}
      <div className="mt-6 space-y-3">
        {chartData.map((item, index) => (
          <div
            key={index}
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
              {chartType === "revenue"
                ? `Rs. ${item.revenue}`
                : `${item.orders} Orders`}
            </span>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}

export default Chart2
