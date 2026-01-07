'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { RefreshCw, ShoppingCart } from 'lucide-react'
import { Table, Button, Badge, Paper, Group, Title, Loader, Text, Center, Stack } from '@mantine/core'
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

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`)
            setOrders(response.data || [])
        } catch (error) {
            toast.error('Gagal memuat riwayat pesanan')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [refreshTrigger])

    return (
        <Paper shadow="sm" radius="md" withBorder>
            <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                <Title order={3} size="h4">Riwayat Pesanan</Title>
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
                            <Table.Th>ID</Table.Th>
                            <Table.Th>Produk</Table.Th>
                            <Table.Th>Qty</Table.Th>
                            <Table.Th>Total</Table.Th>
                            <Table.Th>Waktu</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {orders.map((order) => (
                            <Table.Tr key={order.id}>
                                <Table.Td>{order.id}</Table.Td>
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
        </Paper>
    )
}
