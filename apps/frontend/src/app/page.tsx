'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Artist {
    id: string
    name: string
    bio?: string
    cover_url?: string
}

export default function HomePage() {
    const [artists, setArtists] = useState<Artist[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchArtists()
    }, [])

    const fetchArtists = async () => {
        try {
            const res = await fetch(`${API_URL}/api/artists`)
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setArtists(data.data || [])
        } catch {
            setError('Failed to load artists')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <main className="container mx-auto px-4 py-8">
                <div className="text-center py-16">
                    <div className="animate-spin w-8 h-8 border-2 border-player-accent border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading...</p>
                </div>
            </main>
        )
    }

    return (
        <main className="container mx-auto px-4 py-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold gradient-text">Song Demo</h1>
                <Link
                    href="/admin"
                    className="px-6 py-3 bg-player-accent hover:bg-player-accent-hover rounded-full font-semibold transition-colors"
                >
                    Admin
                </Link>
            </header>

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Artists Grid */}
            {artists.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-player-surface flex items-center justify-center">
                        <svg className="w-12 h-12 text-player-accent/50" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No artists yet</h2>
                    <p className="text-gray-400 mb-6">Go to admin to add your first artist</p>
                    <Link
                        href="/admin"
                        className="inline-block px-8 py-3 bg-player-accent hover:bg-player-accent-hover rounded-full font-semibold transition-colors"
                    >
                        Go to Admin
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {artists.map((artist) => (
                        <Link
                            key={artist.id}
                            href={`/artist/${artist.id}`}
                            className="group bg-player-surface rounded-xl overflow-hidden hover:bg-player-surface-hover transition-all hover:scale-[1.02] hover:shadow-xl"
                        >
                            {/* Cover Image */}
                            <div className="aspect-square bg-gradient-to-br from-player-accent/20 to-purple-900/20 relative overflow-hidden">
                                {artist.cover_url ? (
                                    <img
                                        src={artist.cover_url}
                                        alt={artist.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-16 h-16 text-player-accent/30" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Artist Info */}
                            <div className="p-4">
                                <h3 className="font-bold text-lg truncate">{artist.name}</h3>
                                {artist.bio && (
                                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{artist.bio}</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    )
}
