import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  // Check if a user session exists, then sign out
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.auth.signOut()
  }

  // Redirect the browser back to the marketing landing page
  const origin = new URL(request.url).origin
  return NextResponse.redirect(`${origin}/`, {
    status: 303, // 303 See Other is ideal for redirecting after a POST request
  })
}