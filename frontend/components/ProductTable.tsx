'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { RefreshCw, Plus, Edit, Trash, Search, ArrowUp, ArrowDown } from 'lucide-react'
import { Table, Button, Badge, Paper, Group, Title, Loader, Text, Center, Stack, Modal, ActionIcon, Tooltip, TextInput, Pagination, Select } from '@mantine/core'
import { useDisclosure, useDebouncedValue } from '@mantine/hooks'
import ProductForm from './ProductForm'

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
  onProductUpdate?: () => void
}

export default function ProductTable({ refreshTrigger, onProductUpdate }: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [opened, { open, close }] = useDisclosure(false)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  // Pagination & Filter States
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 500)
  const [sortBy, setSortBy] = useState<string>('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    open()
  }

  const handleAdd = () => {
    setEditingProduct(null)
    open()
  }

  const confirmDelete = (product: Product) => {
    setProductToDelete(product)
    openDeleteModal()
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${productToDelete.id}`)
      toast.success('Produk berhasil dihapus')
      if (onProductUpdate) onProductUpdate()
      else fetchProducts()
      closeDeleteModal()
    } catch (error) {
      toast.error('Gagal menghapus produk')
      console.error(error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: debouncedSearch,
        sortBy: sortBy,
        order: sortOrder
      })

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products?${params}`)
      setProducts(response.data.data || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      toast.error('Gagal memuat produk')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [refreshTrigger, debouncedSearch, page, limit, sortBy, sortOrder])

  return (
    <Paper shadow="sm" radius="md" withBorder>
      <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
        <Title order={3} size="h4">Daftar Produk</Title>
        <Group>
          <Button
            onClick={fetchProducts}
            loading={loading}
            leftSection={<RefreshCw size={18} />}
            variant="light"
            color="green"
          >
            Refresh
          </Button>
          <Button
            onClick={handleAdd}
            leftSection={<Plus size={18} />}
            color="green"
          >
            Add
          </Button>
        </Group>
      </Group>

      <Group p="md" pb={0}>
        <TextInput
          placeholder="Cari produk..."
          leftSection={<Search size={16} />}
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value)
            setPage(1) // Reset page on search
          }}
          style={{ flex: 1 }}
        />

      </Group>

      <Modal opened={opened} onClose={close} title={editingProduct ? "Edit Produk" : "Tambah Produk Baru"} centered>
        <ProductForm
          initialData={editingProduct}
          onSuccess={() => {
            if (onProductUpdate) {
              onProductUpdate()
            } else {
              fetchProducts()
            }
            close()
          }}
        />
      </Modal>

      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Konfirmasi Hapus" centered>
        <Text size="sm">Apakah Anda yakin ingin menghapus produk <b>{productToDelete?.name}</b>?</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={closeDeleteModal}>Batal</Button>
          <Button color="red" onClick={handleDelete}>Hapus</Button>
        </Group>
      </Modal>


      {
        loading && products.length === 0 ? (
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
                <Table.Th
                  onClick={() => handleSort('id')}
                  style={{ cursor: 'pointer' }}
                >
                  <Group gap="xs">
                    ID
                    {sortBy === 'id' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                  </Group>
                </Table.Th>
                <Table.Th
                  onClick={() => handleSort('name')}
                  style={{ cursor: 'pointer' }}
                >
                  <Group gap="xs">
                    Nama Produk
                    {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                  </Group>
                </Table.Th>
                <Table.Th
                  onClick={() => handleSort('stock')}
                  style={{ cursor: 'pointer' }}
                >
                  <Group gap="xs">
                    Stok
                    {sortBy === 'stock' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                  </Group>
                </Table.Th>
                <Table.Th
                  onClick={() => handleSort('price')}
                  style={{ cursor: 'pointer' }}
                >
                  <Group gap="xs">
                    Harga
                    {sortBy === 'price' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                  </Group>
                </Table.Th>
                <Table.Th>Aksi</Table.Th>
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
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Edit">
                        <ActionIcon variant="light" color="blue" onClick={() => handleEdit(product)}>
                          <Edit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Hapus">
                        <ActionIcon variant="light" color="red" onClick={() => confirmDelete(product)}>
                          <Trash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )
      }

      {total > 0 && (
        <Group justify="space-between" p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
          <Select
            value={String(limit)}
            onChange={(val) => {
              setLimit(Number(val))
              setPage(1)
            }}
            data={['5', '10', '20', '50']}
            w={80}
            allowDeselect={false}
          />
          <Pagination
            total={Math.ceil(total / limit)}
            value={page}
            onChange={setPage}
            color="green"
          />
        </Group>
      )}

    </Paper >
  )
}
