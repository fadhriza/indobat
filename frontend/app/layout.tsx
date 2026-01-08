import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core'
import './globals.css'

export const metadata: Metadata = {
  title: 'Indobat Inventory',
  description: 'Sistem manajemen stok sederhana untuk PBF Farmasi',
}

const theme = createTheme({
  primaryColor: 'green',
  defaultRadius: 'md',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          {children}
          <Toaster position="top-right" />
        </MantineProvider>
      </body>
    </html>
  )
}
