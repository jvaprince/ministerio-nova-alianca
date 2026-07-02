import type { Metadata } from 'next'
import { criarEvento } from '@/lib/agenda/actions'
import BackButton from '@/components/ui/BackButton'
import EventCoverUpload from '@/components/agenda/EventCoverUpload'

export const metadata: Metadata = {
  title: 'Criar Evento — Ministério Nova Aliança',
}

export default function CriarEventoPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] pb-8">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-4 pt-10 pb-5">
          <BackButton href="/agenda" />

          <div className="mt-4">
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35">
              Agenda
            </p>

            <h1 className="text-[26px] font-black text-white tracking-tight mt-1">
              Novo Evento
            </h1>
          </div>
        </div>

        <form action={criarEvento} className="px-4 pt-2 space-y-4">
          <div>
            <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
              Título *
            </label>

            <input
              name="title"
              required
              placeholder="Ex: Santa Ceia"
              className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white text-sm placeholder:text-white/25 outline-none focus:border-brand-400/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
              Tipo *
            </label>

            <select
              name="event_type"
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
              placeholder="Ex: Igreja"
              className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white text-sm placeholder:text-white/25 outline-none focus:border-brand-400/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            />
          </div>

         <EventCoverUpload />

          <div>
            <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
              Descrição
            </label>

            <textarea
              name="description"
              rows={5}
              placeholder="Detalhes do evento..."
              className="w-full resize-none rounded-[24px] border border-brand-300/15 bg-white/[0.05] px-4 py-4 text-white text-sm placeholder:text-white/25 outline-none focus:border-brand-400/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl border border-brand-300/25 bg-brand-gradient py-4 text-sm font-bold text-white shadow-[0_0_28px_rgba(59,130,246,0.18),0_18px_50px_rgba(0,0,0,0.25)] transition-all active:scale-[0.98]"
          >
            Salvar Evento
          </button>
        </form>
      </div>
    </div>
  )
}