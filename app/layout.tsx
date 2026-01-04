import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Building 3D Generator',
  description: 'Generate 3D building models from map images',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}

