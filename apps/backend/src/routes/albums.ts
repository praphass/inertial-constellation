import { Router } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { supabase, BUCKET_NAME } from '../lib/supabase'

export const albumsRouter = Router()

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

// GET /api/albums - List all albums
albumsRouter.get('/', async (req, res) => {
    try {
        const { artist_id } = req.query

        let query = supabase
            .from('albums')
            .select(`
                *,
                artist:artists(id, name),
                tracks(*)
            `)
            .order('created_at', { ascending: false })

        if (artist_id) {
            query = query.eq('artist_id', artist_id)
        }

        const { data: albums, error } = await query

        if (error) throw error

        res.json({ success: true, data: albums })
    } catch (error) {
        console.error('Error fetching albums:', error)
        res.status(500).json({ success: false, error: 'Failed to fetch albums' })
    }
})

// GET /api/albums/:id - Get single album with tracks
albumsRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params

        const { data: album, error } = await supabase
            .from('albums')
            .select(`
                *,
                artist:artists(id, name, cover_url),
                tracks(*)
            `)
            .eq('id', id)
            .order('track_number', { foreignTable: 'tracks', ascending: true })
            .single()

        if (error || !album) {
            return res.status(404).json({ success: false, error: 'Album not found' })
        }

        res.json({ success: true, data: album })
    } catch (error) {
        console.error('Error fetching album:', error)
        res.status(500).json({ success: false, error: 'Failed to fetch album' })
    }
})

// POST /api/albums - Create album
albumsRouter.post('/', upload.single('cover'), async (req, res) => {
    try {
        const { artist_id, title, release_date } = req.body
        const coverFile = req.file

        if (!artist_id || !title) {
            return res.status(400).json({ success: false, error: 'Artist and title are required' })
        }

        let coverUrl: string | null = null
        if (coverFile) {
            const coverExt = coverFile.originalname.split('.').pop() || 'jpg'
            const coverFileName = `${uuidv4()}.${coverExt}`
            const coverPath = `albums/${coverFileName}`

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

        const { data: album, error } = await supabase
            .from('albums')
            .insert({
                artist_id,
                title,
                cover_url: coverUrl,
                release_date: release_date || null
            })
            .select()
            .single()

        if (error) throw error

        res.status(201).json({ success: true, data: album })
    } catch (error) {
        console.error('Error creating album:', error)
        res.status(500).json({ success: false, error: 'Failed to create album' })
    }
})

// PATCH /api/albums/:id - Update album
albumsRouter.patch('/:id', upload.single('cover'), async (req, res) => {
    try {
        const { id } = req.params
        const { title, release_date } = req.body
        const coverFile = req.file

        const updates: Record<string, unknown> = {}
        if (title !== undefined) updates.title = title
        if (release_date !== undefined) updates.release_date = release_date || null

        if (coverFile) {
            const coverExt = coverFile.originalname.split('.').pop() || 'jpg'
            const coverFileName = `${uuidv4()}.${coverExt}`
            const coverPath = `albums/${coverFileName}`

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

        const { data: album, error } = await supabase
            .from('albums')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        res.json({ success: true, data: album })
    } catch (error) {
        console.error('Error updating album:', error)
        res.status(500).json({ success: false, error: 'Failed to update album' })
    }
})

// DELETE /api/albums/:id - Delete album
albumsRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params

        const { error } = await supabase
            .from('albums')
            .delete()
            .eq('id', id)

        if (error) throw error

        res.json({ success: true, message: 'Album deleted' })
    } catch (error) {
        console.error('Error deleting album:', error)
        res.status(500).json({ success: false, error: 'Failed to delete album' })
    }
})
