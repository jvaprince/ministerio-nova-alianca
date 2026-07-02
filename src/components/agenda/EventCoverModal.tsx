'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export default function EventCoverModal({
  src,
  alt,
}: {
  src: string
  alt: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="block w-full">
        <img
          src={src}
          alt={alt}
          className="w-full aspect-[16/9] object-cover rounded-2xl border border-white/[0.08]"
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <X size={22} />
          </button>

          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] object-contain rounded-xl"
          />
        </div>
      )}
    </>
  )
}