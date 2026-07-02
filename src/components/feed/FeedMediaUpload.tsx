'use client'

import { ImagePlus, Video, X } from 'lucide-react'
import { useState } from 'react'

export default function FeedMediaUpload() {
  const [imageName, setImageName] = useState('')
  const [videoName, setVideoName] = useState('')

  return (
    <div className="space-y-3">
      <p className="text-[12px] font-semibold text-white/50 uppercase tracking-wider">
        Mídia opcional
      </p>

      <div className="grid grid-cols-2 gap-3">
        <label className="relative overflow-hidden rounded-[24px] border border-brand-300/15 bg-white/[0.04] p-4 min-h-[120px] flex flex-col items-center justify-center text-center shadow-[0_0_24px_rgba(59,130,246,0.07),inset_0_1px_0_rgba(255,255,255,0.07)] active:scale-[0.98] transition">
          <input
            name="image"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => setImageName(e.target.files?.[0]?.name ?? '')}
          />

          <ImagePlus size={28} className="text-brand-300 mb-3" />

          <p className="text-sm font-bold text-white">
            Foto
          </p>

          <p className="text-[11px] text-white/40 mt-1 line-clamp-1">
            {imageName || 'Adicionar imagem'}
          </p>
        </label>

        <label className="relative overflow-hidden rounded-[24px] border border-brand-300/15 bg-white/[0.04] p-4 min-h-[120px] flex flex-col items-center justify-center text-center shadow-[0_0_24px_rgba(59,130,246,0.07),inset_0_1px_0_rgba(255,255,255,0.07)] active:scale-[0.98] transition">
          <input
            name="video"
            type="file"
            accept="video/*"
            className="sr-only"
            onChange={(e) => setVideoName(e.target.files?.[0]?.name ?? '')}
          />

          <Video size={28} className="text-brand-300 mb-3" />

          <p className="text-sm font-bold text-white">
            Vídeo
          </p>

          <p className="text-[11px] text-white/40 mt-1 line-clamp-1">
            {videoName || 'Adicionar vídeo'}
          </p>
        </label>
      </div>

      {(imageName || videoName) && (
        <p className="text-[11px] text-white/35">
          {imageName && `Imagem: ${imageName}`}
          {imageName && videoName && ' · '}
          {videoName && `Vídeo: ${videoName}`}
        </p>
      )}
    </div>
  )
}