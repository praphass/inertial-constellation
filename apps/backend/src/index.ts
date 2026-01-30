import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { tracksRouter } from './routes/tracks'
import { streamRouter } from './routes/stream'
import { uploadRouter } from './routes/upload'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// CORS - Allow Vercel production and preview URLs
const allowedOrigins = [
    process.env.FRONTEND_URL?.replace(/\/$/, ''), // Remove trailing slash
    'http://localhost:3000',
]

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true)

        // Check if origin is allowed or matches Vercel preview pattern
        const isAllowed = allowedOrigins.some(allowed =>
            allowed && origin.includes(allowed.replace('https://', '').replace('http://', ''))
        ) || origin.includes('.vercel.app')

        if (isAllowed) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/tracks', tracksRouter)
app.use('/api/stream', streamRouter)
app.use('/api/upload', uploadRouter)

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err)
    res.status(500).json({ success: false, error: err.message })
})

app.listen(PORT, () => {
    console.log(`🎵 Backend server running on port ${PORT}`)
})

export default app
