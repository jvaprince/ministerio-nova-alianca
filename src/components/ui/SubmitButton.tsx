'use client'

import { useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

type SubmitButtonProps = {
  children: React.ReactNode
  pendingText?: string
  className?: string
  disabled?: boolean
}

export default function SubmitButton({
  children,
  pendingText = 'Enviando...',
  className = '',
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus()
  const [locked, setLocked] = useState(false)
  const submissionStarted = useRef(false)

  useEffect(() => {
    if (pending) {
      submissionStarted.current = true
      return
    }

    if (submissionStarted.current) {
      submissionStarted.current = false
      setLocked(false)
    }
  }, [pending])

  const isDisabled = disabled || pending || locked

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      onClick={(event) => {
        if (isDisabled) {
          event.preventDefault()
          event.stopPropagation()
          return
        }

        // Bloqueia imediatamente, antes de a Server Action responder.
        setLocked(true)
      }}
      className={`
        flex items-center justify-center gap-2
        transition active:scale-[0.98]
        disabled:cursor-not-allowed
        disabled:opacity-60
        disabled:active:scale-100
        ${className}
      `}
    >
      {(pending || locked) && (
        <Loader2 size={17} className="animate-spin" />
      )}

      <span>
        {pending || locked ? pendingText : children}
      </span>
    </button>
  )
}