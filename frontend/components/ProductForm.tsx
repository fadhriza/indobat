'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { TextInput, NumberInput, Button, Stack } from '@mantine/core'

interface Product {
    id: number
    name: string
    stock: number
    price: number
}

interface ProductFormProps {
    initialData?: Product | null
    onSuccess: () => void
}

export default function ProductForm({ initialData, onSuccess }: ProductFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        stock: 0,
        price: 0,
    })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                stock: initialData.stock,
                price: initialData.price,
            })
        } else {
            setFormData({ name: '', stock: 0, price: 0 })
        }
    }, [initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || formData.stock < 0 || formData.price <= 0) {
            toast.error('Mohon isi semua field dengan benar')
            return
        }

        try {
            setSubmitting(true)
            if (initialData) {
                await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${initialData.id}`, formData)
                toast.success('Produk berhasil diperbarui')
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`, formData)
                toast.success('Produk berhasil ditambahkan')
            }
            onSuccess()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Gagal menyimpan produk')
            console.error(error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
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
                    label="Stok"
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
                    {initialData ? 'Simpan Perubahan' : 'Tambah Produk'}
                </Button>
            </Stack>
        </form>
    )
}
