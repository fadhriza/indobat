'use client'

import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'

interface AddProductFormProps {
  onProductAdded: () => void
}

export default function AddProductForm({ onProductAdded }: AddProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    stock: 0,
    price: 0,
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || formData.stock < 0 || formData.price <= 0) {
      toast.error('Mohon isi semua field dengan benar')
      return
    }

    try {
      setSubmitting(true)
      await axios.post('http://localhost:8080/api/products', formData)
      toast.success('Produk berhasil ditambahkan')
      setFormData({ name: '', stock: 0, price: 0 })
      onProductAdded()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal menambahkan produk')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Plus size={24} className="text-indobat-primary" />
        Tambah Produk Baru
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Produk
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indobat-primary focus:border-transparent"
            placeholder="Contoh: Paracetamol 500mg"
            required
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stok Awal
          </label>
          <input
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indobat-primary focus:border-transparent"
            placeholder="0"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Harga (Rp)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indobat-primary focus:border-transparent"
            placeholder="0"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indobat-primary hover:bg-indobat-dark text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Menambahkan...' : 'Tambah Produk'}
        </button>
      </form>
    </div>
  )
}
