import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { criarRepertorio } from '@/lib/louvores/actions'
import BackButton from '@/components/ui/BackButton'
import CreateRepertorioForm from '@/components/louvores/CreateRepertorioForm'

export const metadata: Metadata = {
  title: 'Criar Repertório — Ministério Nova Aliança',
}

export default async function CriarRepertorioPage() {
  const supabase = await createSupabaseServerClient()

  const today = new Date().toISOString().split('T')[0]

  const { data: events } = await supabase
    .from('events')
    .select('id, title, event_date, event_time')
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true })

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] pb-52">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-4 pt-10 pb-5">
          <BackButton href="/louvores" />

          <div className="mt-4">
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35">
              Louvores
            </p>

            <h1 className="text-[26px] font-black text-white tracking-tight mt-1">
              Novo Repertório
            </h1>
          </div>
        </div>

        <CreateRepertorioForm events={events ?? []} />
      </div>
    </div>
  )
}