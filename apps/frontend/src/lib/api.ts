const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function getApiUrl() {
    return API_URL
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_URL}${endpoint}`
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.error || `HTTP ${res.status}`)
    }

    return res.json()
}

export async function uploadTrack(
    file: File,
    metadata: { title: string; artist?: string }
): Promise<{ success: boolean; data?: { id: string }; error?: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', metadata.title)
    if (metadata.artist) {
        formData.append('artist', metadata.artist)
    }

    const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
    })

    return res.json()
}
