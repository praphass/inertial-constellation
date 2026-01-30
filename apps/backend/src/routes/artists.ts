import { Router } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { supabase, BUCKET_NAME } from '../lib/supabase'

export const artistsRouter = Router()

// Configure multer for cover uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Only image files are allowed'))
        }
    },
})

// GET /api/artists - List all artists
artistsRouter.get('/', async (req, res) => {
    try {
        const { data: artists, error } = await supabase
            .from('artists')
            .select('*')
            .order('name', { ascending: true })

        if (error) throw error

        res.json({ success: true, data: artists })
    } catch (error) {
        console.error('Error fetching artists:', error)
        res.status(500).json({ success: false, error: 'Failed to fetch artists' })
    }
})

// GET /api/artists/:id - Get single artist with albums
artistsRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params

        const { data: artist, error } = await supabase
            .from('artists')
            .select(`
                *,
                albums (
                    *,
                    tracks (*)
                )
            `)
            .eq('id', id)
            .single()

        if (error || !artist) {
            return res.status(404).json({ success: false, error: 'Artist not found' })
        }

        res.json({ success: true, data: artist })
    } catch (error) {
        console.error('Error fetching artist:', error)
        res.status(500).json({ success: false, error: 'Failed to fetch artist' })
    }
})

// POST /api/artists - Create artist
artistsRouter.post('/', upload.single('cover'), async (req, res) => {
    try {
        const { name, bio } = req.body
        const coverFile = req.file

        if (!name) {
            return res.status(400).json({ success: false, error: 'Name is required' })
        }

        let coverUrl: string | null = null
        if (coverFile) {
            const coverExt = coverFile.originalname.split('.').pop() || 'jpg'
            const coverFileName = `${uuidv4()}.${coverExt}`
            const coverPath = `artists/${coverFileName}`

            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(coverPath, coverFile.buffer, {
                    contentType: coverFile.mimetype,
                })

            if (!uploadError) {
                const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(coverPath)
                coverUrl = data.publicUrl
            }
        }

        const { data: artist, error } = await supabase
            .from('artists')
            .insert({ name, bio, cover_url: coverUrl })
            .select()
            .single()

        if (error) throw error

        res.status(201).json({ success: true, data: artist })
    } catch (error) {
        console.error('Error creating artist:', error)
        res.status(500).json({ success: false, error: 'Failed to create artist' })
    }
})

// PATCH /api/artists/:id - Update artist
artistsRouter.patch('/:id', upload.single('cover'), async (req, res) => {
    try {
        const { id } = req.params
        const { name, bio } = req.body
        const coverFile = req.file

        const updates: Record<string, unknown> = {}
        if (name !== undefined) updates.name = name
        if (bio !== undefined) updates.bio = bio

        if (coverFile) {
            const coverExt = coverFile.originalname.split('.').pop() || 'jpg'
            const coverFileName = `${uuidv4()}.${coverExt}`
            const coverPath = `artists/${coverFileName}`

            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(coverPath, coverFile.buffer, {
                    contentType: coverFile.mimetype,
                })

            if (!uploadError) {
                const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(coverPath)
                updates.cover_url = data.publicUrl
            }
        }

        updates.updated_at = new Date().toISOString()

        const { data: artist, error } = await supabase
            .from('artists')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        res.json({ success: true, data: artist })
    } catch (error) {
        console.error('Error updating artist:', error)
        res.status(500).json({ success: false, error: 'Failed to update artist' })
    }
})

// DELETE /api/artists/:id - Delete artist
artistsRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params

        const { error } = await supabase
            .from('artists')
            .delete()
            .eq('id', id)

        if (error) throw error

        res.json({ success: true, message: 'Artist deleted' })
    } catch (error) {
        console.error('Error deleting artist:', error)
        res.status(500).json({ success: false, error: 'Failed to delete artist' })
    }
})
