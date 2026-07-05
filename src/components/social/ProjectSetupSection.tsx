'use client'

import { ChevronDown, CheckCircle2, Circle } from 'lucide-react'
import { useState } from 'react'

type Props = {
  title: string
  subtitle: string
  completed?: boolean
  children: React.ReactNode
}

export default function ProjectSetupSection({
  title,
  subtitle,
  completed = false,
  children,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-4">
          {completed ? (
            <CheckCircle2 className="text-[#E4572E]" size={22} />
          ) : (
            <Circle className="text-white/25" size={22} />
          )}

          <div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-sm text-white/45">{subtitle}</p>
          </div>
        </div>

        <ChevronDown
          size={20}
          className={`transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-white/10 p-5">
          {children}
        </div>
      )}
    </div>
  )
}