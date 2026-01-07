'use client'

import { useEffect, useState } from 'react'
import { Pill, Check } from 'lucide-react'
import AddProductForm from '@/components/AddProductForm'
import ProductTable from '@/components/ProductTable'
import OrderForm from '@/components/OrderForm'
import ThemeToggle from '@/components/ThemeToggle'
import { Container, Grid, Title, Text, Group, ThemeIcon, Paper, List, Box } from '@mantine/core'

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
    <Box mih="100vh" bg="var(--mantine-color-body)">
      {/* Header */}
      <Paper shadow="sm" radius={0} p="md" withBorder>
        <Container size="xl">
          <Group justify="space-between">
            <Group>
              <ThemeIcon size={48} radius="md" color="green">
                <Pill size={32} />
              </ThemeIcon>
              <div>
                <Title order={1} size="h2">Mini-Indobat Inventory</Title>
                <Text c="dimmed" size="sm">Sistem Manajemen Stok Farmasi</Text>
              </div>
            </Group>
            <ThemeToggle />
          </Group>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container size="xl" py="xl">
        <Grid gutter="xl">
          {/* Left Column - Forms */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Box mb="md">
              <AddProductForm onProductAdded={handleProductAdded} />
            </Box>
            <Box>
              <OrderForm refreshTrigger={refreshTrigger} />
            </Box>
          </Grid.Col>

          {/* Right Column - Product Table */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <ProductTable refreshTrigger={refreshTrigger} />
          </Grid.Col>
        </Grid>

        {/* Info Section */}
        <Paper mt={48} p="lg" radius="md" shadow="sm" withBorder style={{ borderLeft: '4px solid var(--mantine-color-green-filled)' }}>
          <Title order={3} size="h4" mb="xs">Fitur Keamanan</Title>
          <List
            spacing="xs"
            size="sm"
            center
            icon={
              <ThemeIcon color="green" size={20} radius="xl">
                <Check size={12} />
              </ThemeIcon>
            }
          >
            <List.Item>
              <Text span fw={700}>Race Condition Safe:</Text> Menggunakan database locking untuk mencegah stok negatif saat transaksi concurrent
            </List.Item>
            <List.Item>
              <Text span fw={700}>Real-time Stock Tracking:</Text> Stok diperbarui secara real-time setelah setiap transaksi
            </List.Item>
            <List.Item>
              <Text span fw={700}>Diskon Otomatis:</Text> Hitung harga dengan diskon persentase yang fleksibel
            </List.Item>
            <List.Item>
              <Text span fw={700}>Validasi Input:</Text> Semua input divalidasi untuk memastikan data konsisten
            </List.Item>
          </List>
        </Paper>
      </Container>
    </Box>
  )
}
