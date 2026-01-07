'use client'

import { useEffect, useState } from 'react'
import { Pill, Check, ShoppingCart } from 'lucide-react'
import AddProductForm from '@/components/AddProductForm'
import ProductTable from '@/components/ProductTable'
import OrderHistoryTable from '@/components/OrderHistoryTable'
import OrderForm from '@/components/OrderForm'
import ThemeToggle from '@/components/ThemeToggle'
import { Container, Grid, Title, Text, Group, ThemeIcon, Paper, List, Box, Tabs } from '@mantine/core'

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
                <Title order={1} size="h2">Indobat Inventory</Title>
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

          {/* Right Column - Product Table & History */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Tabs defaultValue="products" variant="outline" radius="md">
              <Tabs.List>
                <Tabs.Tab value="products" leftSection={<Pill size={16} />}>Product Items</Tabs.Tab>
                <Tabs.Tab value="orders" leftSection={<ShoppingCart size={16} />}>Order History</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="products" pt="xs">
                <ProductTable refreshTrigger={refreshTrigger} />
              </Tabs.Panel>

              <Tabs.Panel value="orders" pt="xs">
                <OrderHistoryTable refreshTrigger={refreshTrigger} />
              </Tabs.Panel>
            </Tabs>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  )
}
