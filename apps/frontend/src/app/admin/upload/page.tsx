'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function AdminUploadPage() {
    const router = useRouter()
    const [authenticated, setAuthenticated] = useState(false)
    const [title, setTitle] = useState('')
    const [artist, setArtist] = useState('')
    const [audioFile, setAudioFile] = useState<File | null>(null)
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreview, setCoverPreview] = useState<string | null>(null)
    const [shareEnabled, setShareEnabled] = useState(true)
    const [shareExpiresAt, setShareExpiresAt] = useState('')
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [dragActive, setDragActive] = useState(false)
    const audioInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const isAuth = sessionStorage.getItem('admin_auth') === 'true'
        if (!isAuth) {
            router.push('/admin')
        } else {
            setAuthenticated(true)
        }
    }, [router])

    const handleAudioSelect = (file: File) => {
        if (!file.type.startsWith('audio/')) {
            setError('Please select an audio file')
            return
        }
        if (file.size > 50 * 1024 * 1024) {
            setError('File size must be less than 50MB')
            return
        }
        setAudioFile(file)
        if (!title) {
            setTitle(file.name.replace(/\.[^/.]+$/, ''))
        }
        setError('')
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

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)
        const file = e.dataTransfer.files[0]
        if (file) {
            if (file.type.startsWith('audio/')) {
                handleAudioSelect(file)
            } else if (file.type.startsWith('image/')) {
                handleCoverSelect(file)
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!audioFile || !title) {
            setError('Please select an audio file and enter a title')
            return
        }

        setUploading(true)
        setError('')

        try {
            const formData = new FormData()
            formData.append('file', audioFile)
            formData.append('title', title)
            if (artist) formData.append('artist', artist)
            if (coverFile) formData.append('cover', coverFile)
            formData.append('share_enabled', String(shareEnabled))
            if (shareExpiresAt) formData.append('share_expires_at', shareExpiresAt)

            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()
            if (data.success) {
                router.push('/admin')
            } else {
                setError(data.error || 'Upload failed')
            }
        } catch {
            setError('Failed to upload track')
        }
        setUploading(false)
    }

    if (!authenticated) {
        return null
    }

    return (
        <main className="container mx-auto px-4 py-8 max-w-2xl">
            {/* Header */}
            <header className="flex items-center gap-4 mb-8">
                <Link href="/admin" className="text-gray-400 hover:text-white">
                    ← Back
                </Link>
                <h1 className="text-2xl font-bold">Add New Track</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Audio File Drop Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => audioInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragActive ? 'border-player-accent bg-player-accent/10' :
                            audioFile ? 'border-green-500 bg-green-500/10' :
                                'border-gray-600 hover:border-gray-500'
                        }`}
                >
                    <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={(e) => e.target.files?.[0] && handleAudioSelect(e.target.files[0])}
                        className="hidden"
                    />
                    {audioFile ? (
                        <div>
                            <svg className="w-12 h-12 mx-auto mb-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="font-semibold">{audioFile.name}</p>
                            <p className="text-gray-400 text-sm">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    ) : (
                        <div>
                            <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                            </svg>
                            <p className="font-semibold">Drop audio file here</p>
                            <p className="text-gray-400 text-sm">or click to browse (max 50MB)</p>
                        </div>
                    )}
                </div>

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
                    disabled={uploading || !audioFile}
                    className="w-full py-4 bg-player-accent hover:bg-player-accent-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-semibold transition-colors"
                >
                    {uploading ? 'Uploading...' : 'Upload Track'}
                </button>
            </form>
        </main>
    )
}
