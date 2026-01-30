import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getApiUrl } from '@/lib/api'
import AudioPlayer from '@/components/AudioPlayer'
import ShareButton from '@/components/ShareButton'

interface Track {
    id: string
    title: string
    artist: string
    cover_url?: string
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

    const streamUrl = `${getApiUrl()}/api/stream/${track.id}`

    return (
        <main className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{track.title}</h1>
                    <p className="text-gray-400">{track.artist}</p>
                </div>
                <ShareButton trackId={track.id} title={track.title} />
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
        </main>
    )
}

