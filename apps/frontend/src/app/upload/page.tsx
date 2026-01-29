'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { uploadTrack } from '@/lib/api'

export default function UploadPage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>(null)
    const [title, setTitle] = useState('')
    const [artist, setArtist] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile && droppedFile.type.startsWith('audio/')) {
            setFile(droppedFile)
            // Auto-fill title from filename
            const name = droppedFile.name.replace(/\.[^/.]+$/, '')
            if (!title) setTitle(name)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            const name = selectedFile.name.replace(/\.[^/.]+$/, '')
            if (!title) setTitle(name)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !title) return

        setIsUploading(true)
        setError(null)

        try {
            const result = await uploadTrack(file, { title, artist })
            if (result.success && result.data?.id) {
                router.push(`/track/${result.data.id}`)
            } else {
                setError(result.error || 'Upload failed')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <main className="container mx-auto px-4 py-8 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-2xl font-bold">Upload Track</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Drag & Drop Zone */}
                <div
                    className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${dragActive ? 'border-player-accent bg-player-accent/10' : 'border-gray-700 hover:border-gray-500'}
            ${file ? 'border-green-500 bg-green-500/10' : ''}
          `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {file ? (
                        <div>
                            <svg className="w-12 h-12 mx-auto mb-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="font-semibold">{file.name}</p>
                            <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    ) : (
                        <div>
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="font-semibold mb-2">Drag & drop your audio file</p>
                            <p className="text-gray-400 text-sm">or click to browse (MP3, WAV, up to 50MB)</p>
                        </div>
                    )}
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Track title"
                        required
                        className="w-full px-4 py-3 bg-player-surface border border-gray-700 rounded-lg focus:border-player-accent focus:outline-none transition-colors"
                    />
                </div>

                {/* Artist */}
                <div>
                    <label className="block text-sm font-medium mb-2">Artist</label>
                    <input
                        type="text"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        placeholder="Artist name"
                        className="w-full px-4 py-3 bg-player-surface border border-gray-700 rounded-lg focus:border-player-accent focus:outline-none transition-colors"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                        {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!file || !title || isUploading}
                    className={`
            w-full py-4 rounded-full font-semibold text-lg transition-all
            ${!file || !title || isUploading
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-player-accent hover:bg-player-accent-hover'}
          `}
                >
                    {isUploading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Uploading...
                        </span>
                    ) : (
                        'Upload Track'
                    )}
                </button>
            </form>
        </main>
    )
}
