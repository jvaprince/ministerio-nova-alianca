'use client'

import { useMemo, useState } from 'react'
import {
  Calendar,
  Link2,
  ListMusic,
  Plus,
  Save,
  Trash2,
  Youtube,
  FileText,
  Music,
  GripVertical,
} from 'lucide-react'

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

function formatEventDate(date: string, time?: string | null) {
  const formatted = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  })

  return time ? `${formatted} • ${time.slice(0, 5)}` : formatted
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
  const [selectedEvent, setSelectedEvent] = useState(repertorio.event_id ?? '')

  const [songs, setSongs] = useState<Song[]>(
    [...(repertorio.songs ?? [])].sort((a, b) => a.position - b.position)
  )

  const selectedEventData = useMemo(
    () => events.find((event) => event.id === selectedEvent),
    [events, selectedEvent]
  )

  function addSong() {
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

  function removeSong(id: string) {
    setSongs((prev) =>
      prev
        .filter((song) => song.id !== id)
        .map((song, index) => ({
          ...song,
          position: index + 1,
        }))
    )
  }

  function moveSong(id: string, direction: 'up' | 'down') {
    setSongs((prev) => {
      const currentIndex = prev.findIndex((song) => song.id === id)
      if (currentIndex === -1) return prev

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (targetIndex < 0 || targetIndex >= prev.length) return prev

      const copy = [...prev]
      const current = copy[currentIndex]
      copy[currentIndex] = copy[targetIndex]
      copy[targetIndex] = current

      return copy.map((song, index) => ({
        ...song,
        position: index + 1,
      }))
    })
  }

  return (
    <form action={action} className="px-4 pt-5 space-y-5">
      <section className="grid grid-cols-3 gap-2">
        <div className="rounded-[22px] border border-brand-300/15 bg-white/[0.04] p-3 text-center">
          <ListMusic size={17} className="mx-auto mb-1 text-brand-300" />
          <p className="text-[18px] font-black text-white">{songs.length}</p>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
            Louvores
          </p>
        </div>

        <div className="rounded-[22px] border border-emerald-300/15 bg-emerald-500/10 p-3 text-center">
          <Calendar size={17} className="mx-auto mb-1 text-emerald-300" />
          <p className="text-[18px] font-black text-white">
            {selectedEvent ? 'Sim' : 'Não'}
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
            Evento
          </p>
        </div>

        <div className="rounded-[22px] border border-amber-300/15 bg-amber-500/10 p-3 text-center">
          <Youtube size={17} className="mx-auto mb-1 text-amber-300" />
          <p className="text-[18px] font-black text-white">
            {songs.filter((song) => song.youtube_url?.trim()).length}
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
            Links
          </p>
        </div>
      </section>

      <section className="rounded-[30px] border border-brand-300/15 bg-white/[0.04] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.07)]">
        <p className="mb-4 text-[11px] font-black uppercase tracking-[0.24em] text-brand-400">
          Informações do repertório
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-white/35">
              <Music size={14} />
              Título
            </label>

            <input
              name="title"
              required
              defaultValue={repertorio.title}
              placeholder="Ex: Repertório do Culto Jovem"
              className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white outline-none placeholder:text-white/25 focus:border-brand-300/35"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-white/35">
              <Calendar size={14} />
              Evento
            </label>

            <select
              name="event_id"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full rounded-2xl border border-brand-300/15 bg-[#0b1020] px-4 py-3.5 text-white outline-none focus:border-brand-300/35"
            >
              <option value="">Sem evento vinculado</option>

              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} — {formatEventDate(event.event_date, event.event_time)}
                </option>
              ))}
            </select>

            {selectedEventData && (
              <p className="mt-2 text-[12px] text-white/35">
                Vinculado a {selectedEventData.title} em{' '}
                {formatEventDate(selectedEventData.event_date, selectedEventData.event_time)}.
              </p>
            )}
          </div>

          {!selectedEvent && (
            <div>
              <label className="mb-2 flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-white/35">
                <Calendar size={14} />
                Data do repertório
              </label>

              <input
                type="date"
                name="worship_date"
                defaultValue={repertorio.worship_date ?? ''}
                className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white outline-none focus:border-brand-300/35"
              />
            </div>
          )}

          <div>
            <label className="mb-2 flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-white/35">
              <FileText size={14} />
              Descrição
            </label>

            <textarea
              name="description"
              rows={4}
              defaultValue={repertorio.description ?? ''}
              placeholder="Ex: Separar tons, ouvir as músicas e chegar com antecedência."
              className="w-full resize-none rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/25 focus:border-brand-300/35"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/35">
              Músicas do repertório
            </p>
            <p className="mt-1 text-[12px] text-white/30">
              Edite a ordem, links e observações de cada louvor.
            </p>
          </div>

          <button
            type="button"
            onClick={addSong}
            className="h-10 w-10 rounded-full border border-brand-300/20 bg-brand-500/10 text-brand-300 flex items-center justify-center active:scale-95"
          >
            <Plus size={18} />
          </button>
        </div>

        {songs.length === 0 ? (
          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-8 text-center">
            <Music size={28} className="mx-auto mb-3 text-white/25" />
            <p className="font-bold text-white">Nenhum louvor adicionado.</p>
            <p className="mt-1 text-sm text-white/40">
              Clique em adicionar para montar o repertório.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {songs.map((song, index) => (
              <div
                key={song.id}
                className="rounded-[30px] border border-brand-300/15 bg-white/[0.04] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <input type="hidden" name="song_id" value={song.id} />
                <input type="hidden" name="song_position" value={index + 1} />

                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-300/15 bg-brand-500/10 text-brand-300">
                      <GripVertical size={17} />
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-brand-400">
                        Louvor {index + 1}
                      </p>
                      <p className="text-[12px] text-white/35">
                        {song.title?.trim() || 'Sem título'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSong(song.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-400 active:scale-95"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveSong(song.id, 'up')}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.035] py-2 text-xs font-bold text-white/55 disabled:opacity-30"
                  >
                    Subir
                  </button>

                  <button
                    type="button"
                    disabled={index === songs.length - 1}
                    onClick={() => moveSong(song.id, 'down')}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.035] py-2 text-xs font-bold text-white/55 disabled:opacity-30"
                  >
                    Descer
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-white/30">
                      Nome do louvor
                    </label>

                    <input
                      name="song_title"
                      defaultValue={song.title}
                      placeholder="Nome"
                      className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-brand-300/35"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white/30">
                      <Link2 size={13} />
                      Link do YouTube
                    </label>

                    <input
                      name="youtube_url"
                      defaultValue={song.youtube_url}
                      placeholder="https://youtube.com/..."
                      className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-brand-300/35"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-white/30">
                      Observações
                    </label>

                    <textarea
                      name="song_description"
                      defaultValue={song.description ?? ''}
                      rows={3}
                      placeholder="Tom, entrada, observações para o grupo..."
                      className="w-full resize-none rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-brand-300/35"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={addSong}
        className="w-full h-12 rounded-2xl border border-brand-300/20 bg-brand-500/10 text-brand-300 font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        <Plus size={18} />
        Adicionar louvor
      </button>

      <div className="sticky bottom-4 z-20">
        <button
          type="submit"
          className="w-full rounded-2xl bg-brand-gradient py-4 text-sm font-black text-white shadow-[0_16px_40px_rgba(16,86,176,0.35)] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Save size={18} />
          Salvar alterações
        </button>
      </div>
    </form>
  )
}