'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { RefreshCw, Plus } from 'lucide-react'

interface Product {
  id: number
  name: string
  stock: number
  price: number
  created_at: string
  updated_at: string
}

interface ProductTableProps {
  refreshTrigger: number
}

export default function ProductTable({ refreshTrigger }: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`)
      setProducts(response.data || [])
    } catch (error) {
      toast.error('Gagal memuat produk')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [refreshTrigger])

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Daftar Produk</h2>
        <button
          onClick={fetchProducts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indobat-primary text-white rounded-lg hover:bg-indobat-dark transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {loading && products.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <div className="animate-spin inline-block">
            <RefreshCw size={24} />
          </div>
          <p className="mt-2">Memuat data...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <Plus size={24} className="mx-auto mb-2 opacity-50" />
          <p>Belum ada produk. Tambahkan produk terlebih dahulu.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nama Produk</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Stok</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Harga</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700">{product.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    Rp {product.price.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
