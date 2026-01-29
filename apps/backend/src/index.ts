import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { tracksRouter } from './routes/tracks'
import { streamRouter } from './routes/stream'
import { uploadRouter } from './routes/upload'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
