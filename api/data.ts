import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: any, res: any) {
  // CORS setup for local dev and API requests
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Simple Auth Check
  const appPassword = process.env.APP_PASSWORD
  if (appPassword) {
    const authHeader = req.headers.authorization
    if (!authHeader || authHeader !== `Bearer ${appPassword}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const { key } = req.query

  if (!key) {
    return res.status(400).json({ error: 'Missing key' })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('app_data')
      .select('value')
      .eq('key', key)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return res.status(200).json({ value: null })
      }
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ value: data?.value })
  }

  if (req.method === 'POST') {
    const { value } = req.body

    const { error } = await supabase
      .from('app_data')
      .upsert({ key, value })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
