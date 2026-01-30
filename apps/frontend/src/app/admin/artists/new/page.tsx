'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function NewArtistPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [bio, setBio] = useState('')
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreview, setCoverPreview] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setCoverFile(file)
            setCoverPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            setError('Name is required')
            return
        }

        setSaving(true)
        setError('')

        try {
            const formData = new FormData()
            formData.append('name', name)
            if (bio) formData.append('bio', bio)
            if (coverFile) formData.append('cover', coverFile)

            const res = await fetch(`${API_URL}/api/artists`, {
                method: 'POST',
                body: formData,
            })

            if (res.ok) {
                router.push('/admin')
            } else {
                throw new Error('Failed to create artist')
            }
        } catch {
            setError('Failed to create artist')
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

            <h1 className="text-2xl font-bold mb-6">Add New Artist</h1>

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
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
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

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium mb-2">Name *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-player-bg rounded-lg"
                        placeholder="Artist name"
                        required
                    />
                </div>

                {/* Bio */}
                <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full px-4 py-3 bg-player-bg rounded-lg h-24 resize-none"
                        placeholder="Artist biography (optional)"
                    />
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-player-accent hover:bg-player-accent-hover rounded-lg font-semibold disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Create Artist'}
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
