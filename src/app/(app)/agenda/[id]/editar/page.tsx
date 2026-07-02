import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { editarEvento } from '@/lib/agenda/actions'
import BackButton from '@/components/ui/BackButton'
import EventCoverUpload from '@/components/agenda/EventCoverUpload'

export const metadata: Metadata = {
  title: 'Editar Evento — Ministério Nova Aliança',
}

export default async function EditarEventoPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!event) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const podeEditar =
    profile?.role === 'admin' ||
    profile?.role === 'leader' ||
    event.created_by === user.id

  if (!podeEditar) redirect(`/agenda/${params.id}`)

  const editarComId = editarEvento.bind(null, params.id)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] pb-8">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-4 pt-10 pb-5">
          <BackButton href={`/agenda/${event.id}`} />

          <div className="mt-4">
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35">
              Agenda
            </p>

            <h1 className="text-[26px] font-black text-white tracking-tight mt-1">
              Editar Evento
            </h1>
          </div>
        </div>

        <form action={editarComId} className="px-4 pt-2 space-y-4">
          <div>
            <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
              Título *
            </label>

            <input
              name="title"
              required
              defaultValue={event.title}
              className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white text-sm placeholder:text-white/25 outline-none focus:border-brand-400/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
              Tipo *
            </label>

            <select
              name="event_type"
              required
              defaultValue={event.event_type}
              className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white text-sm outline-none focus:border-brand-400/45"
            >
              <option value="culto" className="text-black">Culto</option>
              <option value="santa_ceia" className="text-black">Santa Ceia</option>
              <option value="congresso" className="text-black">Congresso</option>
              <option value="visita" className="text-black">Visita</option>
              <option value="evento" className="text-black">Evento</option>
              <option value="outro" className="text-black">Outro</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
                Data *
              </label>

              <input
                name="event_date"
                type="date"
                required
                defaultValue={event.event_date}
                className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white text-sm outline-none focus:border-brand-400/45"
              />
            </div>

            <div>
              <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
                Horário
              </label>

              <input
                name="event_time"
                type="time"
                defaultValue={event.event_time?.slice(0, 5) ?? ''}
                className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white text-sm outline-none focus:border-brand-400/45"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
              Local
            </label>

            <input
              name="location"
              defaultValue={event.location ?? ''}
              className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white text-sm placeholder:text-white/25 outline-none focus:border-brand-400/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            />
          </div>

          {event.cover_url && (
            <div>
              <p className="text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
                Banner atual
              </p>

              <div className="relative overflow-hidden rounded-[28px] border border-brand-300/15 shadow-[0_0_24px_rgba(59,130,246,0.08),0_18px_50px_rgba(0,0,0,0.25)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />

                <img
                  src={event.cover_url}
                  alt={event.title}
                  className="w-full aspect-[16/9] object-cover"
                />
              </div>
            </div>
          )}

          <EventCoverUpload />

          <p className="text-[11px] text-white/30 -mt-2">
            Opcional. Envie apenas se quiser trocar o banner.
          </p>

          <div>
            <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
              Descrição
            </label>

            <textarea
              name="description"
              rows={5}
              defaultValue={event.description ?? ''}
              className="w-full resize-none rounded-[24px] border border-brand-300/15 bg-white/[0.05] px-4 py-4 text-white text-sm placeholder:text-white/25 outline-none focus:border-brand-400/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl border border-brand-300/25 bg-brand-gradient py-4 text-sm font-bold text-white shadow-[0_0_28px_rgba(59,130,246,0.18),0_18px_50px_rgba(0,0,0,0.25)] transition-all active:scale-[0.98]"
          >
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  )
}