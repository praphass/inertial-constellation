import { Router } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { supabase, BUCKET_NAME } from '../lib/supabase'
import type { Track, TrackListResponse, ApiResponse } from '@soundcloud-player/shared'

export const tracksRouter = Router()

// Configure multer for cover uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for covers
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Only image files are allowed'))
        }
    },
})

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

// PATCH /api/tracks/:id - Update track
tracksRouter.patch('/:id', upload.single('cover'), async (req, res) => {
    try {
        const { id } = req.params
        const { title, artist, share_enabled, share_expires_at } = req.body
        const coverFile = req.file

        // Build update object
        const updates: Record<string, unknown> = {}
        if (title !== undefined) updates.title = title
        if (artist !== undefined) updates.artist = artist
        if (share_enabled !== undefined) updates.share_enabled = share_enabled === 'true' || share_enabled === true
        if (share_expires_at !== undefined) updates.share_expires_at = share_expires_at || null

        // Upload new cover if provided
        if (coverFile) {
            const coverExt = coverFile.originalname.split('.').pop() || 'jpg'
            const coverFileName = `${uuidv4()}.${coverExt}`
            const coverPath = `covers/${coverFileName}`

            const { error: coverUploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(coverPath, coverFile.buffer, {
                    contentType: coverFile.mimetype,
                    upsert: false,
                })

            if (!coverUploadError) {
                const { data: publicUrlData } = supabase.storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(coverPath)
                updates.cover_url = publicUrlData.publicUrl
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, error: 'No updates provided' })
        }

        updates.updated_at = new Date().toISOString()

        const { data: track, error } = await supabase
            .from('tracks')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        res.json({ success: true, data: track })
    } catch (error) {
        console.error('Error updating track:', error)
        res.status(500).json({ success: false, error: 'Failed to update track' })
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

