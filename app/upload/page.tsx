import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UploadFlow from './upload-flow'

export default async function UploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in?next=/upload')

  const { data: credits } = await supabase
    .from('credits')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <UploadFlow creditBalance={credits?.balance ?? 0} />
    </div>
  )
}
