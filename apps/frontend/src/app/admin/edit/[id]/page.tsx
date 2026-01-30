'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Track {
    id: string
    title: string
    artist: string
    cover_url?: string
    share_enabled: boolean
    share_expires_at?: string
}

export default function AdminEditPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const router = useRouter()
    const [authenticated, setAuthenticated] = useState(false)
    const [track, setTrack] = useState<Track | null>(null)
    const [title, setTitle] = useState('')
    const [artist, setArtist] = useState('')
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreview, setCoverPreview] = useState<string | null>(null)
    const [shareEnabled, setShareEnabled] = useState(true)
    const [shareExpiresAt, setShareExpiresAt] = useState('')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const coverInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const isAuth = sessionStorage.getItem('admin_auth') === 'true'
        if (!isAuth) {
            router.push('/admin')
            return
        }
        setAuthenticated(true)

        const init = async () => {
            const { id } = await params
            await fetchTrack(id)
        }
        init()
    }, [params, router])

    const fetchTrack = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/api/tracks/${id}`)
            const data = await res.json()
            if (data.success && data.data) {
                const t = data.data
                setTrack(t)
                setTitle(t.title)
                setArtist(t.artist || '')
                setShareEnabled(t.share_enabled !== false)
                setShareExpiresAt(t.share_expires_at ? t.share_expires_at.slice(0, 16) : '')
                setCoverPreview(t.cover_url || null)
            }
        } catch {
            setError('Failed to fetch track')
        }
        setLoading(false)
    }

    const handleCoverSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file')
            return
        }
        setCoverFile(file)
        setCoverPreview(URL.createObjectURL(file))
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!track) return

        setSaving(true)
        setError('')

        try {
            const formData = new FormData()
            formData.append('title', title)
            if (artist) formData.append('artist', artist)
            if (coverFile) formData.append('cover', coverFile)
            formData.append('share_enabled', String(shareEnabled))
            if (shareExpiresAt) formData.append('share_expires_at', shareExpiresAt)

            const res = await fetch(`${API_URL}/api/tracks/${track.id}`, {
                method: 'PATCH',
                body: formData,
            })

            const data = await res.json()
            if (data.success) {
                router.push('/admin')
            } else {
                setError(data.error || 'Update failed')
            }
        } catch {
            setError('Failed to update track')
        }
        setSaving(false)
    }

    if (!authenticated || loading) {
        return (
            <main className="container mx-auto px-4 py-8">
                <div className="text-center py-16 text-gray-400">Loading...</div>
            </main>
        )
    }

    if (!track) {
        return (
            <main className="container mx-auto px-4 py-8">
                <div className="text-center py-16">
                    <p className="text-red-500">Track not found</p>
                    <Link href="/admin" className="text-player-accent hover:underline mt-4 inline-block">
                        Back to Admin
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="container mx-auto px-4 py-8 max-w-2xl">
            {/* Header */}
            <header className="flex items-center gap-4 mb-8">
                <Link href="/admin" className="text-gray-400 hover:text-white">
                    ← Back
                </Link>
                <h1 className="text-2xl font-bold">Edit Track</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Cover Image */}
                <div className="flex gap-4 items-start">
                    <div
                        onClick={() => coverInputRef.current?.click()}
                        className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-600 hover:border-gray-500 cursor-pointer flex items-center justify-center overflow-hidden shrink-0"
                    >
                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleCoverSelect(e.target.files[0])}
                            className="hidden"
                        />
                        {coverPreview ? (
                            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center text-gray-400 text-sm p-2">
                                <svg className="w-8 h-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Cover
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-player-surface border border-gray-700 focus:border-player-accent focus:outline-none"
                                placeholder="Track title"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Artist</label>
                            <input
                                type="text"
                                value={artist}
                                onChange={(e) => setArtist(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-player-surface border border-gray-700 focus:border-player-accent focus:outline-none"
                                placeholder="Artist name"
                            />
                        </div>
                    </div>
                </div>

                {/* Share Settings */}
                <div className="glass rounded-xl p-4 space-y-4">
                    <h3 className="font-semibold">Share Settings</h3>

                    <div className="flex items-center justify-between">
                        <span>Enable sharing</span>
                        <button
                            type="button"
                            onClick={() => setShareEnabled(!shareEnabled)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${shareEnabled ? 'bg-green-500' : 'bg-gray-600'
                                }`}
                        >
                            <span
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${shareEnabled ? 'left-7' : 'left-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {shareEnabled && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Expires at (optional)</label>
                            <input
                                type="datetime-local"
                                value={shareExpiresAt}
                                onChange={(e) => setShareExpiresAt(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-player-surface border border-gray-700 focus:border-player-accent focus:outline-none"
                            />
                        </div>
                    )}
                </div>

                {error && (
                    <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 bg-player-accent hover:bg-player-accent-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-semibold transition-colors"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </main>
    )
}
