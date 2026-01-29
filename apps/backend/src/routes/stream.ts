import { Router } from 'express'
import { supabase, BUCKET_NAME } from '../lib/supabase'

export const streamRouter = Router()

// GET /api/stream/:id - Stream audio file
streamRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params

        // Get track from database
        const { data: track, error: trackError } = await supabase
            .from('tracks')
            .select('file_path, title')
            .eq('id', id)
            .single()

        if (trackError || !track) {
            return res.status(404).json({ error: 'Track not found' })
        }

        // Get signed URL for streaming (valid for 1 hour)
        const { data: signedUrl, error: urlError } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(track.file_path, 3600)

        if (urlError || !signedUrl) {
            return res.status(500).json({ error: 'Failed to generate stream URL' })
        }

        // Redirect to signed URL (client will stream from Supabase directly)
        res.redirect(signedUrl.signedUrl)
    } catch (error) {
        console.error('Stream error:', error)
        res.status(500).json({ error: 'Failed to stream audio' })
    }
})

// GET /api/stream/:id/url - Get signed URL without redirect
streamRouter.get('/:id/url', async (req, res) => {
    try {
        const { id } = req.params

        const { data: track, error: trackError } = await supabase
            .from('tracks')
            .select('file_path')
            .eq('id', id)
            .single()

        if (trackError || !track) {
            return res.status(404).json({ success: false, error: 'Track not found' })
        }

        const { data: signedUrl, error: urlError } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(track.file_path, 3600)

        if (urlError || !signedUrl) {
            return res.status(500).json({ success: false, error: 'Failed to generate URL' })
        }

        res.json({ success: true, data: { url: signedUrl.signedUrl } })
    } catch (error) {
        console.error('Stream URL error:', error)
        res.status(500).json({ success: false, error: 'Failed to get stream URL' })
    }
})
