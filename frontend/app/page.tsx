'use client'

import { useEffect, useState } from 'react'
import { Pill } from 'lucide-react'
import AddProductForm from '@/components/AddProductForm'
import ProductTable from '@/components/ProductTable'
import OrderForm from '@/components/OrderForm'

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const handleOrderCreated = () => {
      setRefreshTrigger((prev) => prev + 1)
    }

    window.addEventListener('orderCreated', handleOrderCreated)
    return () => window.removeEventListener('orderCreated', handleOrderCreated)
  }, [])

  const handleProductAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-indobat-primary p-2 rounded-lg">
              <Pill size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mini-Indobat Inventory</h1>
              <p className="text-gray-600 text-sm mt-1">Sistem Manajemen Stok Farmasi</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-1 space-y-6">
            <AddProductForm onProductAdded={handleProductAdded} />
            <OrderForm refreshTrigger={refreshTrigger} />
          </div>

          {/* Right Column - Product Table */}
          <div className="lg:col-span-2">
            <ProductTable refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6 border-l-4 border-indobat-primary">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Fitur Keamanan</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-indobat-primary font-bold">✓</span>
              <span><strong>Race Condition Safe:</strong> Menggunakan database locking untuk mencegah stok negatif saat transaksi concurrent</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indobat-primary font-bold">✓</span>
              <span><strong>Real-time Stock Tracking:</strong> Stok diperbarui secara real-time setelah setiap transaksi</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indobat-primary font-bold">✓</span>
              <span><strong>Diskon Otomatis:</strong> Hitung harga dengan diskon persentase yang fleksibel</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indobat-primary font-bold">✓</span>
              <span><strong>Validasi Input:</strong> Semua input divalidasi untuk memastikan data konsisten</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
