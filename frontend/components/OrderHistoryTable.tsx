'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { RefreshCw, ShoppingCart, ArrowUp, ArrowDown } from 'lucide-react'
import { Table, Button, Badge, Paper, Group, Title, Loader, Text, Center, Stack, Pagination, Switch, Select } from '@mantine/core'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface Product {
    id: number
    name: string
    price: number
}

interface Order {
    id: number
    product_id: number
    product?: Product // Preloaded from backend
    quantity: number
    total_price: number
    created_at: string
}

interface OrderHistoryTableProps {
    refreshTrigger: number
}

export default function OrderHistoryTable({ refreshTrigger }: OrderHistoryTableProps) {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    // Pagination & Filter States
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [limit, setLimit] = useState(10)
    const [groupByProduct, setGroupByProduct] = useState(false)
    const [sortBy, setSortBy] = useState<string>('created_at')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('asc') // Default asc for new field? Usually desc for date. Let's start asc.
        }
    }

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sortBy: sortBy,
                order: sortOrder,
                groupBy: groupByProduct ? 'product' : ''
            })

            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders?${params}`)
            const responseData = response.data
            setOrders(Array.isArray(responseData) ? responseData : (responseData.data || []))
            setTotal(responseData.total || 0)
        } catch (error) {
            toast.error('Gagal memuat riwayat pesanan')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setPage(1) // Reset page when grouping changes
    }, [groupByProduct])

    useEffect(() => {
        fetchOrders()
    }, [refreshTrigger, page, limit, sortBy, sortOrder, groupByProduct])

    return (
        <Paper shadow="sm" radius="md" withBorder>
            <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                <Title order={3} size="h4">Riwayat Pesanan</Title>
                <Group>
                    <Switch
                        label="Kelompokkan per Produk"
                        checked={groupByProduct}
                        onChange={(event) => setGroupByProduct(event.currentTarget.checked)}
                        color="green"
                    />
                    <Button
                        onClick={fetchOrders}
                        loading={loading}
                        leftSection={<RefreshCw size={18} />}
                        variant="light"
                        color="green"
                    >
                        Refresh
                    </Button>
                </Group>
            </Group>

            {loading && orders.length === 0 ? (
                <Center p="xl" h={200}>
                    <Stack align="center" gap="sm">
                        <Loader size="md" color="green" />
                        <Text c="dimmed">Memuat data...</Text>
                    </Stack>
                </Center>
            ) : orders.length === 0 ? (
                <Center p="xl" h={200}>
                    <Stack align="center" gap="sm">
                        <ShoppingCart size={32} color="var(--mantine-color-gray-5)" />
                        <Text c="dimmed">Belum ada pesanan.</Text>
                    </Stack>
                </Center>
            ) : (
                <Table horizontalSpacing="md" verticalSpacing="sm" striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            {!groupByProduct && (
                                <Table.Th
                                    onClick={() => handleSort('id')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Group gap="xs">
                                        ID
                                        {sortBy === 'id' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                    </Group>
                                </Table.Th>
                            )}
                            <Table.Th>Produk</Table.Th>
                            <Table.Th
                                onClick={() => handleSort('quantity')}
                                style={{ cursor: 'pointer' }}
                            >
                                <Group gap="xs">
                                    {groupByProduct ? 'Total Qty' : 'Qty'}
                                    {sortBy === 'quantity' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                </Group>
                            </Table.Th>
                            <Table.Th
                                onClick={() => handleSort('total_price')}
                                style={{ cursor: 'pointer' }}
                            >
                                <Group gap="xs">
                                    Total
                                    {sortBy === 'total_price' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                </Group>
                            </Table.Th>
                            <Table.Th
                                onClick={() => handleSort('created_at')}
                                style={{ cursor: 'pointer' }}
                            >
                                <Group gap="xs">
                                    {groupByProduct ? 'Terakhir Order' : 'Waktu'}
                                    {sortBy === 'created_at' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                </Group>
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {orders.map((order, index) => (
                            <Table.Tr key={order.id || index}>
                                {!groupByProduct && <Table.Td>{order.id}</Table.Td>}
                                <Table.Td style={{ fontWeight: 500 }}>
                                    {order.product?.name || `Product #${order.product_id}`}
                                </Table.Td>
                                <Table.Td>
                                    <Badge variant="light" color="blue">
                                        {order.quantity}
                                    </Badge>
                                </Table.Td>
                                <Table.Td fw={700}>
                                    Rp {order.total_price.toLocaleString('id-ID')}
                                </Table.Td>
                                <Table.Td>
                                    <Text c="dimmed" size="sm">
                                        {format(new Date(order.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            )}

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
        </Paper>
    )
}
