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
        // Accept audio and image files
        if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Only audio and image files are allowed'))
        }
    },
})

// POST /api/upload - Upload audio file with optional cover
uploadRouter.post('/', upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), async (req, res) => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] }
        const audioFile = files['file']?.[0]
        const coverFile = files['cover']?.[0]

        if (!audioFile) {
            return res.status(400).json({ success: false, error: 'No audio file uploaded' })
        }

        const { title, artist, share_enabled, share_expires_at } = req.body

        if (!title) {
            return res.status(400).json({ success: false, error: 'Title is required' })
        }

        // Generate unique file path for audio
        const fileExt = audioFile.originalname.split('.').pop() || 'mp3'
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `tracks/${fileName}`

        // Upload audio to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, audioFile.buffer, {
                contentType: audioFile.mimetype,
                upsert: false,
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return res.status(500).json({ success: false, error: 'Failed to upload audio file' })
        }

        // Upload cover image if provided
        let coverUrl: string | null = null
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
                // Get public URL for cover
                const { data: publicUrlData } = supabase.storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(coverPath)
                coverUrl = publicUrlData.publicUrl
            }
        }

        // Create track record in database
        const { data: track, error: dbError } = await supabase
            .from('tracks')
            .insert({
                title,
                artist: artist || 'Unknown Artist',
                file_path: filePath,
                file_size: audioFile.size,
                cover_url: coverUrl,
                share_enabled: share_enabled !== 'false',
                share_expires_at: share_expires_at || null,
            })
            .select()
            .single()

        if (dbError) {
            // Cleanup: delete uploaded files if DB insert fails
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

