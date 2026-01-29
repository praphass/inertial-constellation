'use client'

import { useState } from 'react'

interface ShareButtonProps {
    trackId: string
    title: string
}

export default function ShareButton({ trackId, title }: ShareButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        const url = `${window.location.origin}/track/${trackId}`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    url: url,
                })
            } catch (err) {
                // User cancelled or error, fallback to copy
                copyToClipboard(url)
            }
        } else {
            copyToClipboard(url)
        }
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            console.error('Failed to copy')
        }
    }

    return (
        <button
            onClick={handleShare}
            className="px-4 py-2 glass rounded-full flex items-center gap-2 hover:border-player-accent/50 transition-colors"
        >
            {copied ? (
                <>
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-500">Copied!</span>
                </>
            ) : (
                <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Share</span>
                </>
            )}
        </button>
    )
}
