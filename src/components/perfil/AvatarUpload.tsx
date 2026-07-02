'use client'

import { useRef, useState, useTransition } from 'react'
import { getInitials } from '@/lib/utils'
import { uploadAvatar } from '@/lib/auth/actions'
import { Camera, Loader2 } from 'lucide-react'

interface Props {
  currentUrl: string | null
  name: string
}

export default function AvatarUpload({ currentUrl, name }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Selecione apenas imagens (JPG, PNG, WebP…)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5 MB.')
      return
    }

    // Preview local imediato
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    // Upload via Server Action
    const formData = new FormData()
    formData.append('avatar', file)

    startTransition(async () => {
      const result = await uploadAvatar(formData)
      if (result?.error) {
        setError(result.error)
        setPreview(null)
      }
      // Em sucesso, a page revalida e recarrega com a nova URL
    })
  }

  const displayUrl = preview ?? currentUrl

  return (
    <div className="flex flex-col items-center pb-6">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="relative group"
        aria-label="Alterar foto de perfil"
      >
        {/* Avatar */}
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={name}
            className="w-20 h-20 rounded-full object-cover ring-2 ring-brand-500/30"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-brand-gradient flex items-center justify-center text-2xl font-bold text-white">
            {getInitials(name)}
          </div>
        )}

        {/* Overlay de hover / loading */}
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isPending
            ? <Loader2 size={20} className="text-white animate-spin" />
            : <Camera size={20} className="text-white" />
          }
        </div>
      </button>

      <p className="text-[11px] text-white/25 mt-2">
        {isPending ? 'Enviando…' : 'Toque para alterar a foto'}
      </p>

      {error && (
        <p className="text-[11px] text-red-400/80 mt-1 text-center px-4">{error}</p>
      )}

      {/* Input file oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}