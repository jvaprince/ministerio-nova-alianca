'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

type EventItem = {
  id: string
  title: string
  event_date: string
  event_time: string | null
}

type Song = {
  id: string
  title: string
  youtube_url: string
  description: string | null
  position: number
}

export default function EditRepertorioForm({
  action,
  repertorio,
  events,
}: {
  action: (formData: FormData) => void
  repertorio: any
  events: EventItem[]
}) {
  const [selectedEvent, setSelectedEvent] = useState(
    repertorio.event_id ?? ''
  )

  const [songs, setSongs] = useState<Song[]>(
    [...(repertorio.songs ?? [])].sort(
      (a, b) => a.position - b.position
    )
  )

  return (
    <form action={action} className="px-4 pt-4 space-y-4">
      <div>
        <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
          Título
        </label>

        <input
          name="title"
          required
          defaultValue={repertorio.title}
          className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white"
        />
      </div>

      <div>
        <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
          Evento
        </label>

        <select
          name="event_id"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white"
        >
          <option value="" className="text-black">
            Sem evento
          </option>

          {events.map((event) => (
            <option
              key={event.id}
              value={event.id}
              className="text-black"
            >
              {event.title}
            </option>
          ))}
        </select>
      </div>

      {!selectedEvent && (
        <div>
          <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
            Data
          </label>

          <input
            type="date"
            name="worship_date"
            defaultValue={repertorio.worship_date ?? ''}
            className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white"
          />
        </div>
      )}

      <div>
        <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
          Descrição
        </label>

        <textarea
          name="description"
          rows={4}
          defaultValue={repertorio.description ?? ''}
          className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-4 text-white resize-none"
        />
      </div>

      <div className="space-y-4">
        {songs.map((song, index) => (
          <div
            key={song.id}
            className="rounded-[28px] border border-brand-300/15 bg-white/[0.04] p-4"
          >
            <input
              type="hidden"
              name="song_id"
              value={song.id}
            />

            <div className="flex items-center justify-between mb-3">
              <p className="text-brand-400 text-xs font-black uppercase tracking-widest">
                Louvor {index + 1}
              </p>

              <button
                type="button"
                onClick={() =>
                  setSongs((prev) =>
                    prev.filter((s) => s.id !== song.id)
                  )
                }
                className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                name="song_title"
                defaultValue={song.title}
                placeholder="Nome"
                className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3 text-white"
              />

              <input
                name="youtube_url"
                defaultValue={song.youtube_url}
                placeholder="YouTube"
                className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3 text-white"
              />

              <textarea
                name="song_description"
                defaultValue={song.description ?? ''}
                rows={2}
                placeholder="Descrição"
                className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3 text-white resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          setSongs((prev) => [
            ...prev,
            {
              id: `new-${Date.now()}`,
              title: '',
              youtube_url: '',
              description: '',
              position: prev.length + 1,
            },
          ])
        }
        className="w-full h-12 rounded-2xl border border-brand-300/20 bg-brand-500/10 text-brand-300 font-bold flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Adicionar louvor
      </button>

      <button
        type="submit"
        className="w-full rounded-2xl bg-brand-gradient py-4 text-sm font-bold text-white"
      >
        Salvar alterações
      </button>
    </form>
  )
}