'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Track {
    id: string
    title: string
    artist: string
    cover_url?: string
    share_enabled: boolean
    share_expires_at?: string
    created_at: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'

export default function AdminPage() {
    const [authenticated, setAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [tracks, setTracks] = useState<Track[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        // Check if already authenticated
        const isAuth = sessionStorage.getItem('admin_auth') === 'true'
        setAuthenticated(isAuth)
        if (isAuth) {
            fetchTracks()
        }
    }, [])

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('admin_auth', 'true')
            setAuthenticated(true)
            fetchTracks()
        } else {
            setError('Incorrect password')
        }
    }

    const fetchTracks = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/api/tracks`)
            const data = await res.json()
            setTracks(data.data?.tracks || [])
        } catch {
            setError('Failed to fetch tracks')
        }
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this track?')) return

        try {
            const res = await fetch(`${API_URL}/api/tracks/${id}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                setTracks(tracks.filter(t => t.id !== id))
            }
        } catch {
            setError('Failed to delete track')
        }
    }

    const toggleShare = async (id: string, enabled: boolean) => {
        try {
            await fetch(`${API_URL}/api/tracks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ share_enabled: enabled }),
            })
            setTracks(tracks.map(t =>
                t.id === id ? { ...t, share_enabled: enabled } : t
            ))
        } catch {
            setError('Failed to update track')
        }
    }

    if (!authenticated) {
        return (
            <main className="container mx-auto px-4 py-8 max-w-md">
                <div className="glass rounded-xl p-8">
                    <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full px-4 py-3 rounded-lg bg-player-surface border border-gray-700 focus:border-player-accent focus:outline-none mb-4"
                        />
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <button
                            type="submit"
                            className="w-full py-3 bg-player-accent hover:bg-player-accent-hover rounded-full font-semibold transition-colors"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </main>
        )
    }

    return (
        <main className="container mx-auto px-4 py-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-gray-400 hover:text-white">
                        ← Back
                    </Link>
                    <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
                </div>
                <Link
                    href="/admin/upload"
                    className="px-6 py-3 bg-player-accent hover:bg-player-accent-hover rounded-full font-semibold transition-colors"
                >
                    + Add Track
                </Link>
            </header>

            {error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-16 text-gray-400">Loading...</div>
            ) : tracks.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-gray-400 mb-4">No tracks yet</p>
                    <Link
                        href="/admin/upload"
                        className="inline-block px-6 py-3 bg-player-accent hover:bg-player-accent-hover rounded-full font-semibold transition-colors"
                    >
                        Add Your First Track
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {tracks.map((track) => (
                        <div key={track.id} className="glass rounded-xl p-4 flex items-center gap-4">
                            {/* Cover */}
                            <div className="w-16 h-16 rounded-lg bg-player-surface flex items-center justify-center overflow-hidden shrink-0">
                                {track.cover_url ? (
                                    <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-8 h-8 text-player-accent/40" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                    </svg>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{track.title}</h3>
                                <p className="text-gray-400 text-sm truncate">{track.artist || 'Unknown Artist'}</p>
                            </div>

                            {/* Share Toggle */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">Share</span>
                                <button
                                    onClick={() => toggleShare(track.id, !track.share_enabled)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${track.share_enabled !== false ? 'bg-green-500' : 'bg-gray-600'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${track.share_enabled !== false ? 'left-7' : 'left-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Link
                                    href={`/admin/edit/${track.id}`}
                                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(track.id)}
                                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}
