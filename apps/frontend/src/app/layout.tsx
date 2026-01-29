import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'SoundCloud Player',
    description: 'Share and play your music with a modern audio player',
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
