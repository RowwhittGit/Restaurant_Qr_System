"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface DataItem {
  timeRange: string
  orders: number
  revenue: number
}

interface ApiResponse {
  date: string
  success: boolean
  data: DataItem[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#9D72FF", "#FF6384"]

function Chart() {
  const [chartType, setChartType] = useState<"orders" | "revenue">("orders")
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ApiResponse>(
          "https://dummyjson.com/c/d4c4-525e-44d7-952b"
        )
        console.log("Peak sales data:", response.data)
        setApiData(response.data)
      } catch (error) {
        console.error("Error fetching peak sales data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <p>Loading...</p>
  if (!apiData) return <p>No data available</p>

  // Prepare chart data
  const chartData = apiData.data
    .filter((item) => item[chartType] > 0) // remove empty slices
    .map((item) => ({
      name: item.timeRange,
      value: item[chartType],
    }))

  return (
    <div className="p-4 rounded-2xl shadow-md bg-white w-full h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">
          {chartType === "orders" ? "Orders Distribution" : "Revenue Distribution"} <br />
          <span className="text-sm text-gray-500">({apiData.date})</span>
        </h2>
        <button
          onClick={() => setChartType(chartType === "orders" ? "revenue" : "orders")}
          className="px-3 py-1 rounded-lg bg-blue-500 text-white text-sm"
        >
          Switch to {chartType === "orders" ? "Revenue" : "Orders"}
        </button>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default Chart
