'use client'

import { CalendarPlus } from 'lucide-react'

function formatDateTime(date: string, time?: string | null) {
  const cleanTime = time ? time.slice(0, 5) : '08:00'
  return `${date.replaceAll('-', '')}T${cleanTime.replace(':', '')}00`
}

export default function AddToCalendarButton({
  title,
  description,
  location,
  date,
  time,
}: {
  title: string
  description?: string | null
  location?: string | null
  date: string
  time?: string | null
}) {
  function handleAddToCalendar() {
    const start = formatDateTime(date, time)

    const endHour = time
      ? String(Number(time.slice(0, 2)) + 2).padStart(2, '0')
      : '10'

    const end = `${date.replaceAll('-', '')}T${endHour}${time ? time.slice(3, 5) : '00'}00`

    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ministerio Nova Alianca//Agenda//PT-BR
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${description ?? ''}
LOCATION:${location ?? ''}
DTSTART:${start}
DTEND:${end}
END:VEVENT
END:VCALENDAR
`.trim()

    const blob = new Blob([icsContent], {
      type: 'text/calendar;charset=utf-8',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `${title}.ics`
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleAddToCalendar}
      className="w-full inline-flex items-center justify-center gap-2 bg-brand-500/15 border border-brand-500/20 text-brand-400 text-sm font-semibold py-3 rounded-xl active:scale-[0.98] transition-transform"
    >
      <CalendarPlus size={16} />
      Adicionar ao calendário
    </button>
  )
}