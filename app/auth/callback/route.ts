import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin: requestOrigin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/upload'
  // Behind Railway's proxy, request.url reflects the app's internal address
  // (localhost:PORT) rather than the public domain — use the known public
  // app URL instead, same pattern already used for Stripe redirect URLs.
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? requestOrigin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`)
}
