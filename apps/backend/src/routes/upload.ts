import { Router } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { supabase, BUCKET_NAME } from '../lib/supabase'
import type { Track, CreateTrackInput, ApiResponse } from '@soundcloud-player/shared'

export const uploadRouter = Router()

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Only accept audio files
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true)
        } else {
            cb(new Error('Only audio files are allowed'))
        }
    },
})

// POST /api/upload - Upload audio file
uploadRouter.post('/', upload.single('file'), async (req, res) => {
    try {
        const file = req.file
        if (!file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' })
        }

        const { title, artist, cover_url } = req.body as CreateTrackInput

        if (!title) {
            return res.status(400).json({ success: false, error: 'Title is required' })
        }

        // Generate unique file path
        const fileExt = file.originalname.split('.').pop() || 'mp3'
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `tracks/${fileName}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return res.status(500).json({ success: false, error: 'Failed to upload file' })
        }

        // Create track record in database
        const { data: track, error: dbError } = await supabase
            .from('tracks')
            .insert({
                title,
                artist: artist || 'Unknown Artist',
                file_path: filePath,
                file_size: file.size,
                cover_url: cover_url || null,
            })
            .select()
            .single()

        if (dbError) {
            // Cleanup: delete uploaded file if DB insert fails
            await supabase.storage.from(BUCKET_NAME).remove([filePath])
            throw dbError
        }

        const response: ApiResponse<Track> = {
            success: true,
            data: track as Track,
        }

        res.status(201).json(response)
    } catch (error) {
        console.error('Upload error:', error)
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to upload track'
        })
    }
})
