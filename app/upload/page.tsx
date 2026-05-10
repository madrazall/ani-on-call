import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UploadFlow from './upload-flow'

async function getBalance(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('credits')
    .select('balance')
    .eq('user_id', userId)
    .single()
  return data?.balance ?? 0
}

export default async function UploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const balance = await getBalance(user.id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <UploadFlow creditBalance={balance} />
    </div>
  )
}
