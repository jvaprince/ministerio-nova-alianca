import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { editarRepertorio } from '@/lib/louvores/actions'
import BackButton from '@/components/ui/BackButton'
import EditRepertorioForm from '@/components/louvores/EditRepertorioForm'

export default async function EditarRepertorioPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!['admin', 'leader'].includes(profile?.role ?? '')) {
    redirect(`/louvores/${params.id}`)
  }

  const { data: repertorio } = await supabase
    .from('worship_sets')
    .select(`
      *,
      songs:worship_songs (
        id,
        title,
        youtube_url,
        description,
        position
      )
    `)
    .eq('id', params.id)
    .single()

  if (!repertorio) notFound()

  const { data: events } = await supabase
    .from('events')
    .select('id, title, event_date, event_time')
    .order('event_date')

  const editarComId = editarRepertorio.bind(null, params.id)

  return (
    <div className="relative min-h-screen bg-[#050816] pb-52">
      <div className="px-4 pt-10">
        <BackButton href={`/louvores/${params.id}`} />

        <div className="mt-4">
          <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35">
            Louvores
          </p>

          <h1 className="text-[26px] font-black text-white mt-1">
            Editar Repertório
          </h1>
        </div>
      </div>

      <EditRepertorioForm
        action={editarComId}
        repertorio={repertorio}
        events={events ?? []}
      />
    </div>
  )
}