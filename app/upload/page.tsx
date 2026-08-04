import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UploadFlow from './upload-flow'
import { isPromoActive } from '@/lib/promo'

async function getBalance(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('credits')
    .select('balance')
    .eq('user_id', userId)
    .single()
  return data?.balance ?? 0
}

async function getIsFirstRunFree(userId: string): Promise<boolean> {
  if (!isPromoActive()) return false
  const supabase = await createClient()
  const { count } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
  return (count ?? 0) === 0
}

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<{ outcome?: string }>
}) {
  const { outcome } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const next = outcome ? `/upload?outcome=${encodeURIComponent(outcome)}` : '/upload'
    redirect(`/sign-in?next=${encodeURIComponent(next)}`)
  }

  const balance = await getBalance(user.id)
  const isFirstRunFree = await getIsFirstRunFree(user.id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <UploadFlow creditBalance={balance} isFirstRunFree={isFirstRunFree} />
    </div>
  )
}
