import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function getCredits(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('credits')
    .select('balance')
    .eq('user_id', userId)
    .single()
  return data?.balance ?? 0
}

export default async function Nav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const balance = user ? await getCredits(user.id) : null

  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-gray-900 tracking-tight">
          SHIT
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-500">
                {balance} {balance === 1 ? 'credit' : 'credits'}
              </span>
              <Link
                href="/buy"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Buy credits
              </Link>
              <form action="/api/auth/sign-out" method="POST">
                <button
                  type="submit"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
