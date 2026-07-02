'use client'

import { excluirEvento } from '@/lib/agenda/actions'

export default function DeleteEventButton({ eventId }: { eventId: string }) {
  return (
    <form
      action={excluirEvento}
      className="flex-1"
      onSubmit={(e) => {
        const ok = window.confirm('Tem certeza que deseja excluir este evento?')
        if (!ok) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={eventId} />

      <button
        type="submit"
        className="w-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold py-2.5 rounded-xl"
      >
        Excluir
      </button>
    </form>
  )
}