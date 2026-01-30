import { notFound } from 'next/navigation'
import { getApiUrl } from '@/lib/api'
import AudioPlayer from '@/components/AudioPlayer'

interface Track {
    id: string
    title: string
    artist: string
    cover_url?: string
    share_enabled?: boolean
    share_expires_at?: string
    created_at: string
}

async function getTrack(id: string): Promise<Track | null> {
    try {
        const res = await fetch(`${getApiUrl()}/api/tracks/${id}`, {
            cache: 'no-store',
        })
        if (!res.ok) return null
        const data = await res.json()
        return data.data || null
    } catch {
        return null
    }
}

function isExpired(expiresAt?: string): boolean {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
}

export default async function TrackPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const track = await getTrack(id)

    if (!track) {
        notFound()
    }

    // Check if sharing is disabled or expired
    if (track.share_enabled === false) {
        return (
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-lg mx-auto text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Link Disabled</h1>
                    <p className="text-gray-400">This track is not available for sharing.</p>
                </div>
            </main>
        )
    }

    if (isExpired(track.share_expires_at)) {
        return (
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-lg mx-auto text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Link Expired</h1>
                    <p className="text-gray-400">This share link has expired.</p>
                </div>
            </main>
        )
    }

    const streamUrl = `${getApiUrl()}/api/stream/${track.id}`

    return (
        <main className="container mx-auto px-4 py-8">
            {/* Minimal header - listener only */}
            <div className="max-w-3xl mx-auto mb-8 text-center">
                <h1 className="text-2xl font-bold mb-1">{track.title}</h1>
                <p className="text-gray-400">{track.artist}</p>
            </div>

            {/* Player */}
            <div className="max-w-3xl mx-auto">
                <AudioPlayer
                    audioUrl={streamUrl}
                    title={track.title}
                    artist={track.artist}
                    coverUrl={track.cover_url}
                />
            </div>

            {/* Simple branding footer */}
            <div className="max-w-3xl mx-auto mt-8 text-center text-gray-500 text-sm">
                Powered by Song Demo
            </div>
        </main>
    )
}


