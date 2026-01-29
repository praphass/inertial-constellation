import { Router } from 'express'
import { supabase } from '../lib/supabase'
import type { Track, TrackListResponse, ApiResponse } from '@soundcloud-player/shared'

export const tracksRouter = Router()

// GET /api/tracks - List all tracks
tracksRouter.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const offset = (page - 1) * limit

        const { data: tracks, error, count } = await supabase
            .from('tracks')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) throw error

        const response: ApiResponse<TrackListResponse> = {
            success: true,
            data: {
                tracks: tracks as Track[],
                total: count || 0,
                page,
                limit,
            },
        }

        res.json(response)
    } catch (error) {
        console.error('Error fetching tracks:', error)
        res.status(500).json({ success: false, error: 'Failed to fetch tracks' })
    }
})

// GET /api/tracks/:id - Get single track
tracksRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params

        const { data: track, error } = await supabase
            .from('tracks')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !track) {
            return res.status(404).json({ success: false, error: 'Track not found' })
        }

        const response: ApiResponse<Track> = {
            success: true,
            data: track as Track,
        }

        res.json(response)
    } catch (error) {
        console.error('Error fetching track:', error)
        res.status(500).json({ success: false, error: 'Failed to fetch track' })
    }
})

// DELETE /api/tracks/:id - Delete track
tracksRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params

        // Get track to find file path
        const { data: track, error: fetchError } = await supabase
            .from('tracks')
            .select('file_path')
            .eq('id', id)
            .single()

        if (fetchError || !track) {
            return res.status(404).json({ success: false, error: 'Track not found' })
        }

        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('audio-files')
            .remove([track.file_path])

        if (storageError) {
            console.error('Storage delete error:', storageError)
        }

        // Delete from database
        const { error: deleteError } = await supabase
            .from('tracks')
            .delete()
            .eq('id', id)

        if (deleteError) throw deleteError

        res.json({ success: true, message: 'Track deleted' })
    } catch (error) {
        console.error('Error deleting track:', error)
        res.status(500).json({ success: false, error: 'Failed to delete track' })
    }
})
