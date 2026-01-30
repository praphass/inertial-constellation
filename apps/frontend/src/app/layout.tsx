import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Song Demo',
    description: 'Share and play your demo tracks',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="antialiased min-h-screen bg-player-bg">{children}</body>
        </html>
    )
}
