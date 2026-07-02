'use client'

import { useState } from 'react'

export default function QuizSubmitButton({
  formAction,
}: {
  formAction: (formData: FormData) => void
}) {
  const [error, setError] = useState(false)

  return (
    <>
      {error && (
        <div className="mt-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3">
          <p className="text-amber-400 text-sm">
            ⚠️ Selecione uma alternativa antes de verificar.
          </p>
        </div>
      )}

      <button
        type="submit"
        formAction={formAction}
        onClick={(e) => {
          const checked = document.querySelector(
            'input[name="quiz_answer"]:checked'
          )

          if (!checked) {
            e.preventDefault()
            setError(true)
          }
        }}
        className="w-full mt-4 h-11 rounded-2xl bg-brand-gradient text-white font-semibold"
      >
        Verificar resposta
      </button>
    </>
  )
}