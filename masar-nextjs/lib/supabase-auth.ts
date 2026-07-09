import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export function getSupabase() {
  return createClient(supabaseUrl, supabaseKey)
}

export async function verifySupabaseToken(accessToken: string) {
  const supabase = getSupabase()
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user) return null
  return user
}
