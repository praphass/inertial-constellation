'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'

interface Artist {
    id: string
    name: string
    cover_url?: string
}

interface Album {
    id: string
    title: string
    cover_url?: string
    artist?: Artist
}

interface Track {
    id: string
    title: string
    artist?: string
    album_id?: string
    share_enabled?: boolean
}

export default function AdminPage() {
    const [authenticated, setAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [tab, setTab] = useState<'artists' | 'albums' | 'tracks'>('artists')
    const [artists, setArtists] = useState<Artist[]>([])
    const [albums, setAlbums] = useState<Album[]>([])
    const [tracks, setTracks] = useState<Track[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        const auth = sessionStorage.getItem('admin_auth')
        if (auth === 'true') {
            setAuthenticated(true)
        }
    }, [])

    useEffect(() => {
        if (authenticated) {
            fetchData()
        }
    }, [authenticated, tab])

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('admin_auth', 'true')
            setAuthenticated(true)
            setError('')
        } else {
            setError('Invalid password')
        }
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            if (tab === 'artists') {
                const res = await fetch(`${API_URL}/api/artists`)
                const data = await res.json()
                setArtists(data.data || [])
            } else if (tab === 'albums') {
                const res = await fetch(`${API_URL}/api/albums`)
                const data = await res.json()
                setAlbums(data.data || [])
            } else {
                const res = await fetch(`${API_URL}/api/tracks`)
                const data = await res.json()
                setTracks(data.data?.tracks || [])
            }
        } catch {
            setError('Failed to fetch data')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (type: string, id: string) => {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return

        try {
            const res = await fetch(`${API_URL}/api/${type}s/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchData()
            }
        } catch {
            setError(`Failed to delete ${type}`)
        }
    }

    if (!authenticated) {
        return (
            <main className="container mx-auto px-4 py-8 max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
                <form onSubmit={handleLogin} className="bg-player-surface p-6 rounded-xl">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
                            {error}
                        </div>
                    )}
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-4 py-3 bg-player-bg rounded-lg mb-4"
                    />
                    <button
                        type="submit"
                        className="w-full px-4 py-3 bg-player-accent hover:bg-player-accent-hover rounded-lg font-semibold"
                    >
                        Login
                    </button>
                </form>
            </main>
        )
    }

    return (
        <main className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <Link href="/" className="text-gray-400 hover:text-white">
                    ← Back to Site
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {(['artists', 'albums', 'tracks'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-lg font-medium capitalize ${tab === t ? 'bg-player-accent' : 'bg-player-surface hover:bg-player-surface-hover'
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Add Button */}
            <div className="mb-6">
                <Link
                    href={`/admin/${tab}/new`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add {tab.slice(0, -1)}
                </Link>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-player-accent border-t-transparent rounded-full mx-auto"></div>
                </div>
            ) : (
                <div className="bg-player-surface rounded-xl overflow-hidden">
                    {/* Artists Tab */}
                    {tab === 'artists' && (
                        <table className="w-full">
                            <thead className="bg-player-bg">
                                <tr>
                                    <th className="text-left px-4 py-3">Name</th>
                                    <th className="text-right px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {artists.map((artist) => (
                                    <tr key={artist.id} className="border-t border-player-bg">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-player-bg overflow-hidden">
                                                    {artist.cover_url && (
                                                        <img src={artist.cover_url} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                {artist.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/admin/artists/${artist.id}`}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm mr-2"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete('artist', artist.id)}
                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {artists.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="px-4 py-8 text-center text-gray-400">
                                            No artists yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* Albums Tab */}
                    {tab === 'albums' && (
                        <table className="w-full">
                            <thead className="bg-player-bg">
                                <tr>
                                    <th className="text-left px-4 py-3">Title</th>
                                    <th className="text-left px-4 py-3">Artist</th>
                                    <th className="text-right px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {albums.map((album) => (
                                    <tr key={album.id} className="border-t border-player-bg">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-player-bg overflow-hidden">
                                                    {album.cover_url && (
                                                        <img src={album.cover_url} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                {album.title}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">{album.artist?.name}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/admin/albums/${album.id}`}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm mr-2"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete('album', album.id)}
                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {albums.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                                            No albums yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* Tracks Tab */}
                    {tab === 'tracks' && (
                        <table className="w-full">
                            <thead className="bg-player-bg">
                                <tr>
                                    <th className="text-left px-4 py-3">Title</th>
                                    <th className="text-left px-4 py-3">Share</th>
                                    <th className="text-right px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tracks.map((track) => (
                                    <tr key={track.id} className="border-t border-player-bg">
                                        <td className="px-4 py-3">{track.title}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs ${track.share_enabled !== false ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                                                }`}>
                                                {track.share_enabled !== false ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/admin/tracks/${track.id}`}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm mr-2"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete('track', track.id)}
                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {tracks.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                                            No tracks yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </main>
    )
}
