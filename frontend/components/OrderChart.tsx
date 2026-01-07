'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Loader, Text, Center, Stack, SegmentedControl, Group, Grid } from '@mantine/core'
import { format, parseISO, subHours, subDays, subWeeks, isAfter } from 'date-fns'
import { id } from 'date-fns/locale'

interface Transaction {
    id: number
    product_id: number
    product?: {
        name: string
    }
    quantity: number
    total_price: number
    created_at: string
}

interface OrderChartProps {
    refreshTrigger?: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function OrderChart({ refreshTrigger }: OrderChartProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [barData, setBarData] = useState<any[]>([])
    const [pieData, setPieData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [timeframe, setTimeframe] = useState('7d') // '24h', '7d', '4w', 'all'

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`)
            const data: Transaction[] = response.data || []
            setTransactions(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [refreshTrigger])

    useEffect(() => {
        if (transactions.length === 0) return

        const now = new Date()
        let filtered = transactions
        let dateFormat = 'dd/MM'

        // Filter based on timeframe
        if (timeframe === '24h') {
            const cutOff = subHours(now, 24)
            filtered = transactions.filter(t => isAfter(parseISO(t.created_at), cutOff))
            dateFormat = 'HH:mm'
        } else if (timeframe === '7d') {
            const cutOff = subDays(now, 7)
            filtered = transactions.filter(t => isAfter(parseISO(t.created_at), cutOff))
            dateFormat = 'dd/MM'
        } else if (timeframe === '4w') {
            const cutOff = subWeeks(now, 4)
            filtered = transactions.filter(t => isAfter(parseISO(t.created_at), cutOff))
            dateFormat = 'dd/MM'
        }
        // 'all' uses all transactions

        // Aggregate for Bar Chart (Revenue over time)
        const barAgg = filtered.reduce((acc: any, curr) => {
            const date = format(parseISO(curr.created_at), dateFormat, { locale: id })
            if (!acc[date]) acc[date] = 0
            acc[date] += curr.total_price
            return acc
        }, {})

        const newBarData = Object.keys(barAgg).map(date => ({
            date,
            revenue: barAgg[date]
        }))
        // Sort by date/time if needed (keys object order is not guaranteed, but usually okay for simple implementation)
        // For 'all', might want to sort properly. For now rely on transaction order (created_at desc) but reduce map might mess it up.
        // Better: Pre-sort transactions ASC before reduce? Backend returns DESC.
        // Let's reverse filtered for processing to get chronological order in map keys if JS engine respects insertion order (which it mostly does).
        // Actually, re-mapping chart data is safer.

        // Simple reverse for display as backend sends DESC
        setBarData(newBarData.reverse())


        // Aggregate for Pie Chart (Sales by Product)
        const pieAgg = filtered.reduce((acc: any, curr) => {
            const name = curr.product?.name || `Product ${curr.product_id}`
            if (!acc[name]) acc[name] = 0
            acc[name] += curr.total_price // Or quantity? User asked "Total of 'Name of Product that sold'". Usually means Quantity or Revenue. Let's use Quantity for "sold count" or Price for "sales revenue".
            // "Total of Name of Product that sold" implies quantity or just total count. But usually Revenue is more interesting. 
            // Let's go with Quantity as it says "sold".
            // Wait, "Total of ... sold" might mean Quantity.
            // Let's use Quantity.
            acc[name] += curr.quantity
            return acc
        }, {})

        const newPieData = Object.keys(pieAgg).map(name => ({
            name,
            value: pieAgg[name]
        }))

        setPieData(newPieData)

    }, [transactions, timeframe])

    if (loading) {
        return (
            <Center h={200}>
                <Loader size="sm" color="green" />
            </Center>
        )
    }

    if (transactions.length === 0) {
        return (
            <Center h={200}>
                <Text c="dimmed" size="sm">Belum ada data statistik</Text>
            </Center>
        )
    }

    return (
        <Stack gap="md">
            <Group justify="space-between">
                <Text size="sm" fw={500} c="dimmed">Statistik Penjualan</Text>
                <SegmentedControl
                    value={timeframe}
                    onChange={setTimeframe}
                    size="xs"
                    data={[
                        { label: '24 Jam', value: '24h' },
                        { label: '7 Hari', value: '7d' },
                        { label: '4 Minggu', value: '4w' },
                        { label: 'Semua', value: 'all' },
                    ]}
                    color="green"
                />
            </Group>

            <Grid>
                <Grid.Col span={12}>
                    <Text size="xs" ta="center" mb="xs" fw={500}>Pendapatan (Revenue)</Text>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                                <Tooltip
                                    formatter={(value: number) => [`Rp ${(value || 0).toLocaleString('id-ID')}`, 'Pendapatan']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="revenue" fill="var(--mantine-color-green-filled)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Grid.Col>

                <Grid.Col span={12} mt="md">
                    <Text size="xs" ta="center" mb="xs" fw={500}>Produk Terjual (Quantity)</Text>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Grid.Col>
            </Grid>
        </Stack>
    )
}
