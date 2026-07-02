'use client'

import { useEffect, useState } from 'react'

export default function PointsToast({
  awarded,
  points,
  message,
}: {
  awarded: boolean
  points: number
  message: string
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2400)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed left-1/2 top-24 z-[9999] -translate-x-1/2 animate-[pointsToast_2.4s_ease-out_forwards] px-4">
      <div className="relative overflow-visible rounded-[28px] border border-amber-300/35 bg-[#0B1020]/95 px-6 py-5 text-center shadow-[0_0_35px_rgba(245,158,11,0.25),0_22px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-amber-400/15 via-transparent to-orange-500/10" />

        <div className="pointer-events-none absolute -inset-px rounded-[28px] bg-gradient-to-r from-amber-300/45 via-yellow-200/25 to-orange-400/45 opacity-70 blur-[1px]" />

        <div className="relative -mt-11 mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/50 bg-[#17110A] shadow-[0_0_30px_rgba(245,158,11,0.45)]">
          <span className="text-3xl">
            {awarded ? '⭐' : '✅'}
          </span>
        </div>

        <div className="relative">
          <p className="text-[26px] font-black tracking-tight text-white drop-shadow">
            {awarded ? `+${points}` : 'Concluído'}
            {awarded && (
              <span className="ml-2 text-base font-bold text-amber-200">
                pontos
              </span>
            )}
          </p>

          <p className="mt-1 text-sm font-semibold text-white/75">
            {awarded ? 'Dia concluído!' : message}
          </p>

          {awarded && (
            <p className="mt-1 text-xs font-medium text-amber-200/80">
              Deus te abençoe.
            </p>
          )}
        </div>

        <div className="pointer-events-none absolute left-5 top-4 h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.9)]" />
        <div className="pointer-events-none absolute right-6 top-8 h-1 w-1 rounded-full bg-yellow-200 shadow-[0_0_12px_rgba(254,240,138,0.9)]" />
        <div className="pointer-events-none absolute bottom-5 left-8 h-1 w-1 rounded-full bg-orange-300 shadow-[0_0_12px_rgba(253,186,116,0.9)]" />
      </div>
    </div>
  )
}