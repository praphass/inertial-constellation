'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Track {
    id: string
    title: string
    artist?: string
    cover_url?: string
    share_enabled?: boolean
}

interface Album {
    id: string
    title: string
    cover_url?: string
    release_date?: string
    tracks: Track[]
}

interface Artist {
    id: string
    name: string
    bio?: string
    cover_url?: string
    albums: Album[]
}

export default function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
    const [artist, setArtist] = useState<Artist | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedAlbum, setExpandedAlbum] = useState<string | null>(null)

    useEffect(() => {
        const fetchArtist = async () => {
            try {
                const { id } = await params
                const res = await fetch(`${API_URL}/api/artists/${id}`)
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setArtist(data.data)
                // Auto-expand first album
                if (data.data?.albums?.length > 0) {
                    setExpandedAlbum(data.data.albums[0].id)
                }
            } catch {
                setError('Failed to load artist')
            } finally {
                setLoading(false)
            }
        }
        fetchArtist()
    }, [params])

    const copyShareLink = (trackId: string) => {
        const url = `${window.location.origin}/track/${trackId}`
        navigator.clipboard.writeText(url)
        alert('Share link copied!')
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

    if (error || !artist) {
        return (
            <main className="container mx-auto px-4 py-8">
                <div className="text-center py-16">
                    <h1 className="text-2xl font-bold mb-4">Artist not found</h1>
                    <Link href="/" className="text-player-accent hover:underline">
                        ← Back to Home
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="container mx-auto px-4 py-8">
            {/* Back Button */}
            <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </Link>

            {/* Artist Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
                {/* Cover */}
                <div className="w-48 h-48 rounded-xl overflow-hidden bg-player-surface flex-shrink-0">
                    {artist.cover_url ? (
                        <img src={artist.cover_url} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-player-accent/20 to-purple-900/20">
                            <svg className="w-16 h-16 text-player-accent/30" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col justify-end">
                    <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Artist</p>
                    <h1 className="text-4xl font-bold mb-2">{artist.name}</h1>
                    {artist.bio && <p className="text-gray-400">{artist.bio}</p>}
                    <p className="text-sm text-gray-500 mt-2">
                        {artist.albums?.length || 0} albums
                    </p>
                </div>
            </div>

            {/* Albums */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Albums</h2>

                {artist.albums?.length === 0 ? (
                    <p className="text-gray-400 py-8 text-center">No albums yet</p>
                ) : (
                    <div className="space-y-4">
                        {artist.albums?.map((album) => (
                            <div key={album.id} className="bg-player-surface rounded-xl overflow-hidden">
                                {/* Album Header - Clickable */}
                                <button
                                    onClick={() => setExpandedAlbum(expandedAlbum === album.id ? null : album.id)}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-player-surface-hover transition-colors text-left"
                                >
                                    {/* Album Cover */}
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-player-bg flex-shrink-0">
                                        {album.cover_url ? (
                                            <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-8 h-8 text-player-accent/30" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Album Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold truncate">{album.title}</h3>
                                        <p className="text-sm text-gray-400">
                                            {album.tracks?.length || 0} tracks
                                            {album.release_date && ` • ${new Date(album.release_date).getFullYear()}`}
                                        </p>
                                    </div>

                                    {/* Expand Icon */}
                                    <svg
                                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedAlbum === album.id ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Tracks List - Expandable */}
                                {expandedAlbum === album.id && album.tracks && album.tracks.length > 0 && (
                                    <div className="border-t border-player-bg">
                                        {album.tracks.map((track, index) => (
                                            <div
                                                key={track.id}
                                                className="flex items-center gap-4 px-4 py-3 hover:bg-player-surface-hover transition-colors"
                                            >
                                                {/* Track Number */}
                                                <span className="w-6 text-center text-gray-500 text-sm">{index + 1}</span>

                                                {/* Track Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{track.title}</p>
                                                </div>

                                                {/* Share Button */}
                                                {track.share_enabled !== false && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            copyShareLink(track.id)
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-player-accent transition-colors"
                                                        title="Copy share link"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                        </svg>
                                                    </button>
                                                )}

                                                {/* Play/Listen Button */}
                                                <Link
                                                    href={`/track/${track.id}`}
                                                    className="p-2 bg-player-accent rounded-full hover:bg-player-accent-hover transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
