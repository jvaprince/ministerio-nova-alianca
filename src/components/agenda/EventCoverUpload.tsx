'use client'

import { ImagePlus } from 'lucide-react'
import { useState } from 'react'

export default function EventCoverUpload() {
  const [fileName, setFileName] = useState('')

  return (
    <div>
      <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
        Banner do evento
      </label>

      <label className="group relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[28px] border border-dashed border-brand-300/20 bg-white/[0.035] p-6 text-center shadow-[0_0_24px_rgba(59,130,246,0.07),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl transition-all duration-300 active:scale-[0.98]">
        <input
          name="cover"
          type="file"
          accept="image/*"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
        />

        <ImagePlus size={30} className="relative text-brand-300 mb-3" />

        <p className="relative font-bold text-white">
          {fileName ? 'Banner selecionado' : 'Adicionar banner'}
        </p>

        <p className="relative mt-1 text-xs text-white/40 line-clamp-1">
          {fileName || 'Toque para selecionar uma imagem'}
        </p>

        <p className="relative mt-3 text-[11px] text-white/25">
          JPG, PNG ou WEBP • até 5MB
        </p>
      </label>
    </div>
  )
}