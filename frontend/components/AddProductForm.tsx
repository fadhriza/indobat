'use client'

import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'
import { Paper, Title, TextInput, NumberInput, Button, Stack, Group, ThemeIcon } from '@mantine/core'

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
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`, formData)
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
    <Paper shadow="sm" radius="md" p="lg" withBorder>
      <Group mb="md">
        <ThemeIcon color="green" variant="light" size="lg">
          <Plus size={20} />
        </ThemeIcon>
        <Title order={3} size="h4">Tambah Produk Baru</Title>
      </Group>

      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Nama Produk"
            placeholder="Contoh: Paracetamol 500mg"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <NumberInput
            label="Stok Awal"
            placeholder="0"
            min={0}
            value={formData.stock}
            onChange={(val) => setFormData({ ...formData, stock: Number(val) })}
            required
          />

          <NumberInput
            label="Harga (Rp)"
            placeholder="0"
            min={0}
            step={0.01}
            value={formData.price}
            onChange={(val) => setFormData({ ...formData, price: Number(val) })}
            required
            hideControls
          />

          <Button
            type="submit"
            loading={submitting}
            fullWidth
            color="green"
            mt="xs"
          >
            Tambah Produk
          </Button>
        </Stack>
      </form>
    </Paper>
  )
}
