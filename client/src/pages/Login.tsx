"use client"

import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Toast, { useToast } from "./../components/Toast"
import { FaEnvelope, FaLock } from "react-icons/fa"

// Configure axios globally to include cookies
axios.defaults.withCredentials = true
import baseApi from "../utils/api"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      showToast("Please enter both email and password", { type: "error" })
      return
    }

    try {
      setLoading(true)
      const response = await baseApi.post("/auth/login", {
        email,
        password,
      }, {
        withCredentials: true,
      })
      showToast("Login successful!", { type: "success" })
      if (response.data.role === "admin") {
        navigate("/admin/menu")
      } else if (response.data.role === "kitchen") {
        navigate("/kitchen")
      }
      // navigate("/admin/menu") // redirect to homepage
    } catch (error: any) {
      console.error("Login error:", error)
      showToast(error.response?.data?.message || "Invalid credentials", {
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Toast />
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-serif">
            Bhatti foods
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Login to order your favourite food
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 bg-gray-100 border border-gray-200 rounded-lg h-12 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 bg-gray-100 border border-gray-200 rounded-lg h-12 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg h-12 font-medium transition-colors"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}
