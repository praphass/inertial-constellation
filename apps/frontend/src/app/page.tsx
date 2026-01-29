import Link from 'next/link'
import { getApiUrl } from '@/lib/api'

interface Track {
    id: string
    title: string
    artist: string
    created_at: string
    cover_url?: string
}

async function getTracks(): Promise<Track[]> {
    try {
        const res = await fetch(`${getApiUrl()}/api/tracks`, {
            cache: 'no-store',
        })
        if (!res.ok) return []
        const data = await res.json()
        return data.data?.tracks || []
    } catch {
        return []
    }
}

export default async function HomePage() {
    const tracks = await getTracks()

    return (
        <main className="container mx-auto px-4 py-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold gradient-text">SoundCloud Player</h1>
                <Link
                    href="/upload"
                    className="px-6 py-3 bg-player-accent hover:bg-player-accent-hover rounded-full font-semibold transition-colors"
                >
                    Upload Track
                </Link>
            </header>

            {/* Track Grid */}
            {tracks.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-player-surface flex items-center justify-center">
                        <svg className="w-12 h-12 text-player-accent/50" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No tracks yet</h2>
                    <p className="text-gray-400 mb-6">Upload your first track to get started</p>
                    <Link
                        href="/upload"
                        className="inline-block px-8 py-3 bg-player-accent hover:bg-player-accent-hover rounded-full font-semibold transition-colors"
                    >
                        Upload Track
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tracks.map((track) => (
                        <Link
                            key={track.id}
                            href={`/track/${track.id}`}
                            className="glass rounded-xl p-4 hover:border-player-accent/50 transition-colors group"
                        >
                            {/* Cover */}
                            <div className="aspect-square rounded-lg mb-4 bg-gradient-to-br from-player-accent/20 to-player-surface flex items-center justify-center overflow-hidden">
                                {track.cover_url ? (
                                    <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-16 h-16 text-player-accent/40 group-hover:text-player-accent/60 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                    </svg>
                                )}
                            </div>
                            {/* Info */}
                            <h3 className="font-semibold text-lg truncate group-hover:text-player-accent transition-colors">
                                {track.title}
                            </h3>
                            <p className="text-gray-400 truncate">{track.artist}</p>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    )
}
