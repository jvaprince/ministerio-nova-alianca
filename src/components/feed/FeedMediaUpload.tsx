'use client'

import { ImagePlus, Video, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { compressImage } from '@/lib/utils/compressImage'

export default function FeedMediaUpload() {
  const [imageName, setImageName] = useState('')
  const [videoName, setVideoName] = useState('')

  const imageInputRef = useRef<HTMLInputElement>(null)

  async function handleImageChange(
  e: React.ChangeEvent<HTMLInputElement>
) {
  console.log('handleImageChange executou')
  const original = e.target.files?.[0]

  if (!original) {
    setImageName('')
    return
  }

  try {
    const compressed = await compressImage(original)

    const dt = new DataTransfer()
    dt.items.add(compressed)

    if (imageInputRef.current) {
      imageInputRef.current.files = dt.files
      console.log(imageInputRef.current?.files?.[0]?.size)
    }

    setImageName(
      `${compressed.name} (${Math.round(compressed.size / 1024)} KB)`
    )

    console.log(
      `Imagem comprimida: ${Math.round(original.size / 1024)} KB → ${Math.round(
        compressed.size / 1024
      )} KB`
    )
  } catch (err) {
    console.error(err)
    setImageName(original.name)
  }
}

  return (
    <div className="space-y-3">
      <p className="text-[12px] font-semibold text-white/50 uppercase tracking-wider">
        Mídia opcional
      </p>

      <div className="grid grid-cols-2 gap-3">
        <label className="relative overflow-hidden rounded-[24px] border border-brand-300/15 bg-white/[0.04] p-4 min-h-[120px] flex flex-col items-center justify-center text-center shadow-[0_0_24px_rgba(59,130,246,0.07),inset_0_1px_0_rgba(255,255,255,0.07)] active:scale-[0.98] transition">
          <input
  ref={imageInputRef}
  name="image"
  type="file"
  accept="image/*"
  className="sr-only"
  onChange={async (e) => {
  const file = e.target.files?.[0]

  if (!file) return

  const compressed = await compressImage(file)

  console.log(file.size)
  console.log(compressed.size)
}}
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