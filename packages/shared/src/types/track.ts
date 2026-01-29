export interface Track {
    id: string
    title: string
    artist: string
    file_path: string
    file_size?: number
    duration?: number
    cover_url?: string | null
    created_at: string
    updated_at: string
}

export interface CreateTrackInput {
    title: string
    artist?: string
    cover_url?: string | null
}

export interface TrackListResponse {
    tracks: Track[]
    total: number
    page: number
    limit: number
}

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
}
