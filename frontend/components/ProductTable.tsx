'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { RefreshCw, Plus } from 'lucide-react'
import { Table, Button, Badge, Paper, Group, Title, Loader, Text, Center, Stack } from '@mantine/core'

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
    <Paper shadow="sm" radius="md" withBorder>
      <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
        <Title order={3} size="h4">Daftar Produk</Title>
        <Button
          onClick={fetchProducts}
          loading={loading}
          leftSection={<RefreshCw size={18} />}
          variant="light"
          color="green"
        >
          Refresh
        </Button>
      </Group>

      {loading && products.length === 0 ? (
        <Center p="xl" h={200}>
          <Stack align="center" gap="sm">
            <Loader size="md" color="green" />
            <Text c="dimmed">Memuat data...</Text>
          </Stack>
        </Center>
      ) : products.length === 0 ? (
        <Center p="xl" h={200}>
          <Stack align="center" gap="sm">
            <Plus size={32} color="var(--mantine-color-gray-5)" />
            <Text c="dimmed">Belum ada produk. Tambahkan produk terlebih dahulu.</Text>
          </Stack>
        </Center>
      ) : (
        <Table horizontalSpacing="md" verticalSpacing="sm" striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Nama Produk</Table.Th>
              <Table.Th>Stok</Table.Th>
              <Table.Th>Harga</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {products.map((product) => (
              <Table.Tr key={product.id}>
                <Table.Td>{product.id}</Table.Td>
                <Table.Td style={{ fontWeight: 500 }}>{product.name}</Table.Td>
                <Table.Td>
                  <Badge
                    color={product.stock > 0 ? 'green' : 'red'}
                    variant="light"
                  >
                    {product.stock}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  Rp {product.price.toLocaleString('id-ID')}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Paper>
  )
}
