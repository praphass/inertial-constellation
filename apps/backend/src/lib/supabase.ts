import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠️ Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY')
}

export const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '')
export const BUCKET_NAME = 'audio-files'
