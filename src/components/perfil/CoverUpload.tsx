'use client'

import { useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { updateProfileCover } from '@/lib/perfil/cover-actions'

type CoverUploadProps = {
  currentUrl?: string | null
}

export default function CoverUpload({ currentUrl }: CoverUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null)

  return (
    <div className="px-4 mb-6">
      <div className="relative h-36 rounded-3xl overflow-hidden border border-white/[0.08] bg-white/[0.04]">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Capa do perfil"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-500/25 via-white/[0.04] to-black flex items-center justify-center">
            <ImagePlus size={26} className="text-white/35" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/25" />

        <form
          action={updateProfileCover}
          className="absolute inset-x-4 bottom-4"
        >
          <label className="block">
            <input
              type="file"
              name="cover"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              required
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return

                setPreviewUrl(URL.createObjectURL(file))
              }}
            />

            <div className="h-10 rounded-2xl bg-black/55 border border-white/10 backdrop-blur flex items-center justify-center gap-2 text-white text-sm font-semibold cursor-pointer">
              <ImagePlus size={16} />
              Escolher capa
            </div>
          </label>

          <button
            type="submit"
            className="w-full h-10 rounded-2xl bg-brand-gradient text-white text-sm font-semibold mt-2"
          >
            Salvar capa
          </button>
        </form>
      </div>
    </div>
  )
}