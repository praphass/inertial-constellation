# SoundCloud-Style Audio Player 🎵

A modern, shareable audio player built with microservices architecture.

## Architecture

| Service | Platform | Tech |
|---------|----------|------|
| **Frontend** | Vercel | Next.js 14, Tailwind CSS, Wavesurfer.js |
| **Backend** | Render | Node.js, Express, Multer |
| **Database** | Supabase | PostgreSQL |
| **Storage** | Supabase | S3-compatible audio storage |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase account

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Create the database table:

```sql
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    duration INTEGER,
    cover_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tracks_created_at ON tracks(created_at DESC);
```

3. Create a storage bucket named `audio-files` with public access

### 3. Environment Variables

**Backend** (`apps/backend/.env`):
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

**Frontend** (`apps/frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development

```bash
# Run both frontend and backend
npm run dev

# Or run separately
npm run dev:frontend
npm run dev:backend
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Set **Root Directory** to `apps/frontend`
4. Add environment variables

### Backend (Render)

1. Create new Web Service in Render
2. Set **Root Directory** to `apps/backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables

## Features

- ✅ Upload MP3 files (up to 50MB)
- ✅ Shareable track links
- ✅ Wavesurfer.js waveform visualization
- ✅ Modern SoundCloud-style UI
- ✅ Download protection (no right-click, no keyboard shortcuts)
- ✅ Mobile responsive design

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tracks` | GET | List all tracks |
| `/api/tracks/:id` | GET | Get single track |
| `/api/tracks/:id` | DELETE | Delete track |
| `/api/stream/:id` | GET | Stream audio |
| `/api/upload` | POST | Upload new track |
