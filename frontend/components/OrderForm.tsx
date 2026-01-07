'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ShoppingCart } from 'lucide-react'

interface Product {
  id: number
  name: string
  stock: number
  price: number
  created_at: string
  updated_at: string
}

interface OrderFormProps {
  refreshTrigger: number
}

export default function OrderForm({ refreshTrigger }: OrderFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    product_id: 0,
    quantity: 1,
    discount_percent: 0,
  })
  const [submitting, setSubmitting] = useState(false)
  const [estimatedPrice, setEstimatedPrice] = useState(0)

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`)
      setProducts(response.data || [])
    } catch (error) {
      toast.error('Gagal memuat produk')
      console.error(error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [refreshTrigger])

  useEffect(() => {
    if (formData.product_id > 0) {
      const product = products.find((p) => p.id === formData.product_id)
      if (product) {
        const subtotal = product.price * formData.quantity
        const discount = subtotal * (formData.discount_percent / 100)
        setEstimatedPrice(subtotal - discount)
      }
    } else {
      setEstimatedPrice(0)
    }
  }, [formData.product_id, formData.quantity, formData.discount_percent, products])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.product_id === 0) {
      toast.error('Pilih produk terlebih dahulu')
      return
    }

    try {
      setSubmitting(true)
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/order`, formData)
      toast.success(`Order berhasil! Sisa stok: ${response.data.remaining_stock}`)
      setFormData({
        product_id: 0,
        quantity: 1,
        discount_percent: 0,
      })
      // Trigger refresh of product table
      window.dispatchEvent(new CustomEvent('orderCreated'))
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal membuat order')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <ShoppingCart size={24} className="text-indobat-primary" />
        Buat Order
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Obat
          </label>
          <select
            value={formData.product_id}
            onChange={(e) => setFormData({ ...formData, product_id: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indobat-primary focus:border-transparent"
            required
          >
            <option value={0}>-- Pilih Produk --</option>
            {products.map((product) => (
              <option key={product.id} value={product.id} disabled={product.stock === 0}>
                {product.name} (Stok: {product.stock})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jumlah
          </label>
          <input
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indobat-primary focus:border-transparent"
            required
          />
        </div>

        {/* Discount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diskon (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.discount_percent}
            onChange={(e) => setFormData({ ...formData, discount_percent: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indobat-primary focus:border-transparent"
          />
        </div>

        {/* Estimated Price */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Estimasi Total Harga</p>
          <p className="text-2xl font-bold text-indobat-primary">
            Rp {estimatedPrice.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || formData.product_id === 0}
          className="w-full bg-indobat-primary hover:bg-indobat-dark text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Memproses...' : 'Buat Order'}
        </button>
      </form>
    </div>
  )
}
