'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { criarRepertorio } from '@/lib/louvores/actions'

type EventItem = {
  id: string
  title: string
  event_date: string
  event_time: string | null
}

export default function CreateRepertorioForm({
  events,
}: {
  events: EventItem[]
}) {
  const [selectedEvent, setSelectedEvent] = useState('')
  const [songs, setSongs] = useState([1])

  return (
    <form action={criarRepertorio} noValidate className="px-4 pt-2 space-y-4">
      <div>
        <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
          Título *
        </label>

        <input
          name="title"
          required
          placeholder="Ex: Louvores do culto de domingo"
          className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white text-sm placeholder:text-white/25 outline-none focus:border-brand-400/45"
        />
      </div>

      <div>
        <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
          Evento da agenda
        </label>

        <select
          name="event_id"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white text-sm outline-none focus:border-brand-400/45"
        >
          <option value="" className="text-black">
            Sem evento vinculado
          </option>

          {events.map((event) => (
            <option key={event.id} value={event.id} className="text-black">
              {event.title} —{' '}
              {new Date(event.event_date + 'T12:00:00').toLocaleDateString('pt-BR')}
            </option>
          ))}
        </select>

        <p className="text-[11px] text-white/30 mt-1">
          Se selecionar um evento, a data será puxada pela agenda.
        </p>
      </div>

      {!selectedEvent && (
        <div>
          <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
            Data do repertório *
          </label>

          <input
  name="worship_date"
  type="date"
            className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white text-sm outline-none focus:border-brand-400/45"
          />
        </div>
      )}

      <div>
        <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
          Descrição geral
        </label>

        <textarea
          name="description"
          rows={4}
          placeholder="Ex: Repertório para o culto da noite. Ouçam antes do ensaio."
          className="w-full resize-none rounded-[24px] border border-brand-300/15 bg-white/[0.05] px-4 py-4 text-white text-sm placeholder:text-white/25 outline-none focus:border-brand-400/45"
        />
      </div>

      <div className="pt-2">
        <p className="text-[12px] font-black tracking-widest uppercase text-white/35 mb-3">
          Louvores
        </p>

        <div className="space-y-4">
          {songs.map((_, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] p-4 shadow-[0_0_24px_rgba(59,130,246,0.07),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />

              <div className="relative flex items-center justify-between mb-3">
                <p className="text-brand-400 text-xs font-black uppercase tracking-widest">
                  Louvor {index + 1}
                </p>

                {songs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSongs(songs.filter((_, i) => i !== index))}
                    className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <div className="relative space-y-3">
                <input
                  name="song_title"
                  required={index === 0}
                  placeholder="Nome do louvor"
                  className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white text-sm placeholder:text-white/25 outline-none focus:border-brand-400/45"
                />

                <input
  name="youtube_url"
  type="text"
  required={index === 0}
  placeholder="Link do YouTube"
  className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white text-sm placeholder:text-white/25 outline-none focus:border-brand-400/45"
/>

                <textarea
                  name="song_description"
                  rows={2}
                  placeholder="Observação opcional"
                  className="w-full resize-none rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white text-sm placeholder:text-white/25 outline-none focus:border-brand-400/45"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSongs([...songs, songs.length + 1])}
          className="mt-4 w-full h-12 rounded-2xl border border-brand-300/20 bg-brand-500/10 text-brand-300 font-bold flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Adicionar louvor
        </button>
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl border border-brand-300/25 bg-brand-gradient py-4 text-sm font-bold text-white shadow-[0_0_28px_rgba(59,130,246,0.18),0_18px_50px_rgba(0,0,0,0.25)] transition-all active:scale-[0.98]"
      >
        Criar Repertório
      </button>
    </form>
  )
}