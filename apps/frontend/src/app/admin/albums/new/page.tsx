'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Artist {
    id: string
    name: string
}

export default function NewAlbumPage() {
    const router = useRouter()
    const [artists, setArtists] = useState<Artist[]>([])
    const [artistId, setArtistId] = useState('')
    const [title, setTitle] = useState('')
    const [releaseDate, setReleaseDate] = useState('')
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreview, setCoverPreview] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchArtists()
    }, [])

    const fetchArtists = async () => {
        try {
            const res = await fetch(`${API_URL}/api/artists`)
            const data = await res.json()
            setArtists(data.data || [])
        } catch {
            setError('Failed to load artists')
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
        if (!artistId || !title.trim()) {
            setError('Artist and title are required')
            return
        }

        setSaving(true)
        setError('')

        try {
            const formData = new FormData()
            formData.append('artist_id', artistId)
            formData.append('title', title)
            if (releaseDate) formData.append('release_date', releaseDate)
            if (coverFile) formData.append('cover', coverFile)

            const res = await fetch(`${API_URL}/api/albums`, {
                method: 'POST',
                body: formData,
            })

            if (res.ok) {
                router.push('/admin')
            } else {
                throw new Error('Failed to create album')
            }
        } catch {
            setError('Failed to create album')
        } finally {
            setSaving(false)
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

            <h1 className="text-2xl font-bold mb-6">Add New Album</h1>

            <form onSubmit={handleSubmit} className="bg-player-surface p-6 rounded-xl space-y-6">
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

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

                {/* Artist */}
                <div>
                    <label className="block text-sm font-medium mb-2">Artist *</label>
                    <select
                        value={artistId}
                        onChange={(e) => setArtistId(e.target.value)}
                        className="w-full px-4 py-3 bg-player-bg rounded-lg"
                        required
                    >
                        <option value="">Select artist</option>
                        {artists.map((artist) => (
                            <option key={artist.id} value={artist.id}>
                                {artist.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-player-bg rounded-lg"
                        placeholder="Album title"
                        required
                    />
                </div>

                {/* Release Date */}
                <div>
                    <label className="block text-sm font-medium mb-2">Release Date</label>
                    <input
                        type="date"
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                        className="w-full px-4 py-3 bg-player-bg rounded-lg"
                    />
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-player-accent hover:bg-player-accent-hover rounded-lg font-semibold disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Create Album'}
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
