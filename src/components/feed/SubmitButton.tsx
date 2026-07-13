'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 bg-brand-gradient text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Publicando...' : 'Salvar'}
    </button>
  )
}