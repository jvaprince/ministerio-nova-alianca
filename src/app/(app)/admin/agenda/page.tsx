import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { excluirEventoAdmin } from '@/lib/admin/actions'

export const metadata: Metadata = {
  title: 'Agenda — Admin Nova Aliança',
}

function formatDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export default async function AdminAgendaPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (myProfile?.role !== 'admin') redirect('/inicio')

  const { data: eventos } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true })

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-52 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-7">
          <Link
            href="/admin"
            className="w-11 h-11 rounded-full border border-brand-300/20 bg-white/[0.04] flex items-center justify-center text-brand-300 backdrop-blur-xl active:scale-95 transition-all"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
              Painel Admin
            </p>

            <h1 className="text-[28px] font-black tracking-tight">
              Agenda
            </h1>
          </div>
        </div>

        <Link
          href="/agenda/criar"
          className="mb-6 flex items-center justify-center gap-2 rounded-2xl border border-brand-300/25 bg-brand-gradient py-4 text-sm font-bold text-white active:scale-[0.98] transition-all"
        >
          <Calendar size={17} />
          Criar novo evento
        </Link>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-black">
              Eventos cadastrados
            </h2>

            <p className="text-xs text-white/35">
              {eventos?.length ?? 0} eventos
            </p>
          </div>

          <div className="space-y-4">
            {eventos?.map((evento: any) => (
              <div
                key={evento.id}
                className="relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              >
                {evento.cover_url ? (
                  <img
                    src={evento.cover_url}
                    alt={evento.title}
                    className="w-full h-40 object-cover border-b border-white/[0.06]"
                  />
                ) : (
                  <div className="h-32 bg-brand-500/10 flex items-center justify-center border-b border-white/[0.06]">
                    <ImageIcon size={28} className="text-white/25" />
                  </div>
                )}

                <div className="p-4">
                  <p className="text-[11px] font-black tracking-[0.22em] uppercase text-brand-400">
                    {evento.event_type ?? 'Evento'}
                  </p>

                  <h2 className="text-xl font-black mt-2">
                    {evento.title}
                  </h2>

                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-sm text-white/55">
                      <Calendar size={15} className="text-brand-300" />
                      {formatDate(evento.event_date)}
                    </div>

                    {evento.event_time && (
                      <div className="flex items-center gap-2 text-sm text-white/55">
                        <Clock size={15} className="text-brand-300" />
                        {evento.event_time.slice(0, 5)}
                      </div>
                    )}

                    {evento.location && (
                      <div className="flex items-center gap-2 text-sm text-white/55">
                        <MapPin size={15} className="text-brand-300" />
                        {evento.location}
                      </div>
                    )}
                  </div>

                  {evento.description && (
                    <p className="text-sm text-white/55 leading-relaxed mt-4">
                      {evento.description}
                    </p>
                  )}
                </div>

                <form action={excluirEventoAdmin} className="p-4 border-t border-white/[0.06]">
                  <input type="hidden" name="event_id" value={evento.id} />

                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-red-400/20 bg-red-500/10 py-3 text-sm font-bold text-red-400 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <Trash2 size={16} />
                    Excluir evento
                  </button>
                </form>
              </div>
            ))}

            {(!eventos || eventos.length === 0) && (
              <div className="rounded-[28px] border border-brand-300/15 bg-white/[0.04] p-8 text-center">
                <Calendar size={28} className="mx-auto text-white/25 mb-3" />
                <p className="text-white/45 text-sm">
                  Nenhum evento cadastrado.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}