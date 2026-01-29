'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import WaveSurfer from 'wavesurfer.js'

interface AudioPlayerProps {
    audioUrl: string
    title: string
    artist: string
    coverUrl?: string | null
}

export default function AudioPlayer({ audioUrl, title, artist, coverUrl }: AudioPlayerProps) {
    const waveformRef = useRef<HTMLDivElement>(null)
    const wavesurferRef = useRef<WaveSurfer | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(0.8)
    const [error, setError] = useState<string | null>(null)

    // Disable right-click
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault()
            return false
        }
        document.addEventListener('contextmenu', handleContextMenu)
        return () => document.removeEventListener('contextmenu', handleContextMenu)
    }, [])

    // Initialize WaveSurfer
    useEffect(() => {
        if (!waveformRef.current) return

        const audio = new Audio()
        audio.src = audioUrl

        const wavesurfer = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#3a3a3a',
            progressColor: '#ff5500',
            cursorColor: '#ff7700',
            cursorWidth: 2,
            barWidth: 3,
            barGap: 2,
            barRadius: 3,
            height: 80,
            normalize: true,
            media: audio,
        })

        wavesurferRef.current = wavesurfer

        wavesurfer.on('ready', () => {
            setIsLoading(false)
            setDuration(wavesurfer.getDuration())
            wavesurfer.setVolume(volume)
        })

        wavesurfer.on('audioprocess', () => {
            setCurrentTime(wavesurfer.getCurrentTime())
        })

        wavesurfer.on('seeking', () => {
            setCurrentTime(wavesurfer.getCurrentTime())
        })

        wavesurfer.on('play', () => setIsPlaying(true))
        wavesurfer.on('pause', () => setIsPlaying(false))
        wavesurfer.on('finish', () => setIsPlaying(false))

        wavesurfer.on('error', (err) => {
            setIsLoading(false)
            setError(`Failed to load audio: ${err}`)
        })

        audio.onerror = () => {
            setIsLoading(false)
            setError('Failed to load audio file')
        }

        return () => {
            wavesurfer.destroy()
        }
    }, [audioUrl])

    useEffect(() => {
        if (wavesurferRef.current) {
            wavesurferRef.current.setVolume(volume)
        }
    }, [volume])

    const togglePlay = useCallback(() => {
        if (wavesurferRef.current) {
            wavesurferRef.current.playPause()
        }
    }, [])

    const formatTime = (seconds: number) => {
        if (!isFinite(seconds) || seconds < 0) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (error) {
        return (
            <div className="glass rounded-2xl p-8 text-center">
                <div className="text-red-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Error Loading Audio</h2>
                <p className="text-gray-400">{error}</p>
            </div>
        )
    }

    return (
        <div className="glass rounded-2xl overflow-hidden no-select" onDragStart={(e) => e.preventDefault()}>
            <div className="flex flex-col md:flex-row">
                {/* Cover */}
                <div className="md:w-48 md:h-48 w-full h-48 bg-gradient-to-br from-player-accent/20 to-player-surface flex-shrink-0">
                    {coverUrl ? (
                        <img src={coverUrl} alt={title} className="w-full h-full object-cover" draggable={false} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-20 h-20 text-player-accent/40" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Track Info */}
                <div className="flex-1 p-6">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white truncate">{title}</h1>
                        <p className="text-gray-400">{artist}</p>
                    </div>

                    {/* Waveform */}
                    <div className="relative mt-4">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-player-surface/50 rounded-lg z-10">
                                <svg className="w-6 h-6 animate-spin text-player-accent" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            </div>
                        )}
                        <div ref={waveformRef} className="rounded-lg overflow-hidden" style={{ opacity: isLoading ? 0.3 : 1 }} />
                    </div>

                    {/* Time */}
                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-4">
                <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-player-accent to-orange-500 flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
                >
                    {isPlaying ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                    </svg>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-24 accent-player-accent"
                    />
                </div>
            </div>
        </div>
    )
}
