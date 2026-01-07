'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ShoppingCart, BarChart2 } from 'lucide-react'
import { Paper, Title, Select, NumberInput, Button, Stack, Text, Tabs, Box, Slider } from '@mantine/core'
import OrderChart from './OrderChart'

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

function OrderFormContent({ refreshTrigger }: OrderFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState<{
    product_id: string | null
    quantity: number
    discount_percent: number
  }>({
    product_id: null,
    quantity: 1,
    discount_percent: 0,
  })
  const [submitting, setSubmitting] = useState(false)
  const [estimatedPrice, setEstimatedPrice] = useState(0)

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products?limit=1000`)
      setProducts(response.data.data || [])
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
        product_id: null,
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
    <form onSubmit={handleSubmit}>
      <Stack>
        <Select
          label="Pilih Obat"
          placeholder="-- Pilih Produk --"
          data={selectData}
          value={formData.product_id}
          onChange={(val) => setFormData({ ...formData, product_id: val })}
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

        <Box>
          <Text size="sm" fw={500} mb={8}>Diskon: {formData.discount_percent}%</Text>
          <Slider
            min={0}
            max={100}
            step={1}
            value={formData.discount_percent}
            onChange={(val) => setFormData({ ...formData, discount_percent: val })}
            marks={[
              { value: 0, label: '0%' },
              { value: 25, label: '25%' },
              { value: 50, label: '50%' },
              { value: 75, label: '75%' },
              { value: 100, label: '100%' },
            ]}
            label={(val) => `${val}%`}
            mb="xl"
          />
        </Box>

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
  )
}

export default function OrderForm({ refreshTrigger }: OrderFormProps) {
  return (
    <Paper shadow="sm" radius="md" p="md" withBorder>
      <Tabs defaultValue="form" variant="pills" radius="md" color="green">
        <Tabs.List grow mb="md">
          <Tabs.Tab value="form" leftSection={<ShoppingCart size={16} />}>
            Buat Order
          </Tabs.Tab>
          <Tabs.Tab value="stats" leftSection={<BarChart2 size={16} />}>
            Statistik
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="form">
          <Box>
            <Title order={3} size="h4" mb="md">Buat Order</Title>
            <OrderFormContent refreshTrigger={refreshTrigger} />
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="stats">
          <Box>
            <Title order={3} size="h4" mb="md">Statistik Order</Title>
            <OrderChart refreshTrigger={refreshTrigger} />
          </Box>
        </Tabs.Panel>
      </Tabs>
    </Paper>
  )
}
