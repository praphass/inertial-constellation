'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Album {
    id: string
    title: string
    artist?: { name: string }
}

export default function NewTrackPage() {
    const router = useRouter()
    const [albums, setAlbums] = useState<Album[]>([])
    const [albumId, setAlbumId] = useState('')
    const [title, setTitle] = useState('')
    const [trackNumber, setTrackNumber] = useState(1)
    const [audioFile, setAudioFile] = useState<File | null>(null)
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreview, setCoverPreview] = useState('')
    const [shareEnabled, setShareEnabled] = useState(true)
    const [shareExpiresAt, setShareExpiresAt] = useState('')
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchAlbums()
    }, [])

    const fetchAlbums = async () => {
        try {
            const res = await fetch(`${API_URL}/api/albums`)
            const data = await res.json()
            setAlbums(data.data || [])
        } catch {
            setError('Failed to load albums')
        }
    }

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setCoverFile(file)
            setCoverPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!audioFile || !title.trim()) {
            setError('Audio file and title are required')
            return
        }

        setUploading(true)
        setError('')

        try {
            const formData = new FormData()
            formData.append('file', audioFile)
            formData.append('title', title)
            if (albumId) formData.append('album_id', albumId)
            formData.append('track_number', String(trackNumber))
            if (coverFile) formData.append('cover', coverFile)
            formData.append('share_enabled', String(shareEnabled))
            if (shareExpiresAt) formData.append('share_expires_at', shareExpiresAt)

            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData,
            })

            if (res.ok) {
                router.push('/admin')
            } else {
                throw new Error('Failed to upload track')
            }
        } catch {
            setError('Failed to upload track')
        } finally {
            setUploading(false)
        }
    }

    return (
        <main className="container mx-auto px-4 py-8 max-w-2xl">
            <Link href="/admin" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Admin
            </Link>

            <h1 className="text-2xl font-bold mb-6">Add New Track</h1>

            <form onSubmit={handleSubmit} className="bg-player-surface p-6 rounded-xl space-y-6">
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Audio File */}
                <div>
                    <label className="block text-sm font-medium mb-2">Audio File *</label>
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                        className="w-full"
                        required
                    />
                    {audioFile && (
                        <p className="text-sm text-gray-400 mt-2">{audioFile.name}</p>
                    )}
                </div>

                {/* Cover Image */}
                <div>
                    <label className="block text-sm font-medium mb-2">Cover Image</label>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-xl bg-player-bg overflow-hidden flex items-center justify-center">
                            {coverPreview ? (
                                <img src={coverPreview} className="w-full h-full object-cover" />
                            ) : (
                                <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                </svg>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverChange}
                            className="text-sm"
                        />
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-player-bg rounded-lg"
                        placeholder="Track title"
                        required
                    />
                </div>

                {/* Album */}
                <div>
                    <label className="block text-sm font-medium mb-2">Album</label>
                    <select
                        value={albumId}
                        onChange={(e) => setAlbumId(e.target.value)}
                        className="w-full px-4 py-3 bg-player-bg rounded-lg"
                    >
                        <option value="">No album (standalone)</option>
                        {albums.map((album) => (
                            <option key={album.id} value={album.id}>
                                {album.title} {album.artist && `- ${album.artist.name}`}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Track Number */}
                <div>
                    <label className="block text-sm font-medium mb-2">Track Number</label>
                    <input
                        type="number"
                        min="1"
                        value={trackNumber}
                        onChange={(e) => setTrackNumber(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 bg-player-bg rounded-lg"
                    />
                </div>

                {/* Share Settings */}
                <div className="border-t border-player-bg pt-6">
                    <h3 className="font-medium mb-4">Share Settings</h3>

                    <div className="flex items-center gap-3 mb-4">
                        <input
                            type="checkbox"
                            id="shareEnabled"
                            checked={shareEnabled}
                            onChange={(e) => setShareEnabled(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label htmlFor="shareEnabled">Enable sharing</label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Expires At</label>
                        <input
                            type="datetime-local"
                            value={shareExpiresAt}
                            onChange={(e) => setShareExpiresAt(e.target.value)}
                            className="w-full px-4 py-3 bg-player-bg rounded-lg"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={uploading}
                        className="px-6 py-3 bg-player-accent hover:bg-player-accent-hover rounded-lg font-semibold disabled:opacity-50"
                    >
                        {uploading ? 'Uploading...' : 'Upload Track'}
                    </button>
                    <Link
                        href="/admin"
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </main>
    )
}
