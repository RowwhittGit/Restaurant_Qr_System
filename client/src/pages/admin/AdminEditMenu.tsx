
import type React from "react"
import { useEffect, useState } from "react"
import { ArrowLeft, Plus, X } from "lucide-react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import Toast, { useToast } from "../../components/Toast"

interface MenuItemForm {
  name: string
  price: number | string
  category: string[]
  image: string
}

const predefinedCategories = [
  "Veg",
  "Non-Veg",
  "Pizza",
  "Burger",
  "Laphing",
  "Platter",
  "Momo",
  "Chowmein",
  "Drinks",
  "Dessert",
]

export default function AdminMenuUpdate() {
  const { id } = useParams()
  const [formData, setFormData] = useState<MenuItemForm>({
    name: "",
    price: "",
    category: [],
    image: "",
  })
  const [newCategory, setNewCategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imagePreviewError, setImagePreviewError] = useState(false)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  const { showToast } = useToast()

  // Fetch existing item
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/menu/${id}`)
        setFormData(res.data.data)
        console.log("Fetched menu item:", res.data)
      } catch (error) {
        console.error("Error fetching menu item:", error)
        showToast("Failed to fetch menu item", { type: "error" })
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchItem()
  }, [id])

  const handleInputChange = (field: keyof MenuItemForm, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (field === "image") {
      setImagePreviewError(false)
    }
  }

  const addCategory = (category: string) => {
    if (category && !formData.category.includes(category)) {
      setFormData((prev) => ({
        ...prev,
        category: [...prev.category, category],
      }))
    }
  }

  const removeCategory = (categoryToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category.filter((cat) => cat !== categoryToRemove),
    }))
  }

  const addNewCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim())
      setNewCategory("")
    }
  }

  // Upload image to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    try {
      const data = new FormData()
      data.append("file", file)
      data.append("upload_preset", "Restaurant1")

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/dpcux5ovk/image/upload`,
        data
      )

      handleInputChange("image", res.data.secure_url)
      showToast("Image uploaded successfully!", { type: "success" })
    } catch (err) {
      console.error("Cloudinary upload error:", err)
      showToast("Failed to upload image", { type: "error" })
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Submit update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price || formData.category.length === 0 || !formData.image) {
      showToast("Please fill in all fields", { type: "error" })
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        image: formData.image,
      }

      await axios.put(`http://localhost:3000/api/menu/${id}`, submitData)

      showToast("Menu item updated successfully!", {
        type: "success",
        toastOptions: {
          position: "top-right",
          autoClose: 2000,
        },
      })

      setTimeout(() => navigate("/admin/menu"), 1500)
    } catch (error) {
      console.error("Error updating menu item:", error)
      showToast("Failed to update menu item", {
        type: "error",
        toastOptions: {
          position: "top-right",
          autoClose: 3000,
        },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading menu item...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto relative">
      <Toast />

      {/* Header */}
      <div className="bg-white px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/menu")} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Update Menu Item</h1>
            <p className="text-sm text-gray-600 mt-1">Edit menu item details</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 pb-20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full" />

            {isUploadingImage && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}

            {formData.image && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="aspect-square w-32 mx-auto rounded-lg overflow-hidden border border-gray-200">
                  {!imagePreviewError ? (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setImagePreviewError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                      Invalid Image
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Name */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Veg Chowmein"
              className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {/* Price */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              placeholder="100"
              min="0"
              step="1"
              className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {/* Categories */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>

            {formData.category.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.category.map((cat) => (
                  <span
                    key={cat}
                    className="bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => removeCategory(cat)}
                      className="hover:bg-red-600 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Predefined Categories */}
            <div className="flex flex-wrap gap-2 mb-3">
              {predefinedCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => addCategory(cat)}
                  disabled={formData.category.includes(cat)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.category.includes(cat)
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Add Custom Category */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add custom category"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addNewCategory())}
              />
              <button
                type="button"
                onClick={addNewCategory}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-semibold text-white transition-colors ${
              isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isSubmitting ? "Updating..." : "Update Menu Item"}
          </button>
        </form>
      </div>
    </div>
  )
}
