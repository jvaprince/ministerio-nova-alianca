'use client'

import { useEffect, useRef } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const sessionIdRef = useRef<string | null>(null)
  const totalSecondsRef = useRef(0)
  const lastActiveAtRef = useRef<number | null>(null)

  async function startSession() {
    try {
      console.log('[usage] iniciando sessão')

      const response = await fetch('/api/usage/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      })

      const text = await response.text()

      if (!response.ok) {
        console.error('[usage] erro ao iniciar:', response.status, text)
        return
      }

      const data = JSON.parse(text)

      sessionIdRef.current = data.session_id
      lastActiveAtRef.current = Date.now()

      console.log('[usage] sessão criada:', data.session_id)
    } catch (error) {
      console.error('[usage] erro inesperado ao iniciar:', error)
    }
  }

  async function flushSession(action: 'update' | 'end' = 'update') {
    if (!sessionIdRef.current || !lastActiveAtRef.current) return

    const now = Date.now()
    const diffSeconds = Math.floor((now - lastActiveAtRef.current) / 1000)

    if (diffSeconds > 0 && document.visibilityState === 'visible') {
      totalSecondsRef.current += diffSeconds
    }

    lastActiveAtRef.current = now

    try {
      const response = await fetch('/api/usage/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          action,
          session_id: sessionIdRef.current,
          duration_seconds: totalSecondsRef.current,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        console.error('[usage] erro ao atualizar:', response.status, text)
      }
    } catch (error) {
      console.error('[usage] erro inesperado ao atualizar:', error)
    }
  }

  useEffect(() => {
    startSession()

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        flushSession('update')
      }
    }, 30000)

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        flushSession('update')
      } else {
        lastActiveAtRef.current = Date.now()
      }
    }

    function handleBeforeUnload() {
      flushSession('end')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      flushSession('end')
    }
  }, [])

  return <>{children}</>
}

export function useTheme() {
  return {
    theme: 'dark' as const,
    setTheme: () => {},
  }
}