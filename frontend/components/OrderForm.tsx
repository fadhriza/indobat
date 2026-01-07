'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ShoppingCart } from 'lucide-react'
import { Paper, Title, Select, NumberInput, Button, Stack, Group, ThemeIcon, Text } from '@mantine/core'

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
    product_id: '',
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
    if (formData.product_id) {
      const product = products.find((p) => String(p.id) === formData.product_id)
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

    if (!formData.product_id) {
      toast.error('Pilih produk terlebih dahulu')
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        product_id: Number(formData.product_id),
        quantity: formData.quantity,
        discount_percent: formData.discount_percent
      }
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/order`, payload)
      toast.success(`Order berhasil! Sisa stok: ${response.data.remaining_stock}`)
      setFormData({
        product_id: '',
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

  const selectData = products.map((product) => ({
    value: String(product.id),
    label: `${product.name} (Stok: ${product.stock})`,
    disabled: product.stock === 0
  }))

  return (
    <Paper shadow="sm" radius="md" p="lg" withBorder>
      <Group mb="md">
        <ThemeIcon color="green" variant="light" size="lg">
          <ShoppingCart size={20} />
        </ThemeIcon>
        <Title order={3} size="h4">Buat Order</Title>
      </Group>

      <form onSubmit={handleSubmit}>
        <Stack>
          <Select
            label="Pilih Obat"
            placeholder="-- Pilih Produk --"
            data={selectData}
            value={formData.product_id}
            onChange={(val) => setFormData({ ...formData, product_id: val || '' })}
            searchable
            required
          />

          <NumberInput
            label="Jumlah"
            min={1}
            value={formData.quantity}
            onChange={(val) => setFormData({ ...formData, quantity: Number(val) })}
            required
          />

          <NumberInput
            label="Diskon (%)"
            min={0}
            max={100}
            step={0.01}
            value={formData.discount_percent}
            onChange={(val) => setFormData({ ...formData, discount_percent: Number(val) })}
          />

          {/* Estimated Price */}
          <Paper bg="var(--mantine-color-blue-light)" p="md" withBorder style={{ borderColor: 'var(--mantine-color-blue-light-color)' }}>
            <Text size="sm" c="blue" mb={4}>Estimasi Total Harga</Text>
            <Text size="xl" fw={700} c="blue">
              Rp {estimatedPrice.toLocaleString('id-ID')}
            </Text>
          </Paper>

          <Button
            type="submit"
            loading={submitting}
            fullWidth
            color="green"
            mt="xs"
            disabled={!formData.product_id}
          >
            Buat Order
          </Button>
        </Stack>
      </form>
    </Paper>
  )
}
