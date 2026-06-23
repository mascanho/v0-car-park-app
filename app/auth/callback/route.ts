import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      const email = user?.email ?? ''
      if (!email.endsWith('@slimstock.com')) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/auth?error=invalid_domain`)
      }
      const forwarded = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      const allowedOrigin = isLocalEnv
        ? `${origin}`
        : forwarded
          ? `https://${forwarded}`
          : origin
      return NextResponse.redirect(`${allowedOrigin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
}
