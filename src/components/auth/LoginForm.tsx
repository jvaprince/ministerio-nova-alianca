'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  Mail,
  Lock,
  Sparkles,
} from 'lucide-react'
import { signIn } from '@/lib/auth/actions'

interface LoginFormProps {
  redirectTo?: string
  errorFromUrl?: string
}

const URL_ERRORS: Record<string, string> = {
  link_invalido: 'O link expirou ou é inválido. Solicite um novo.',
}

export default function LoginForm({ redirectTo, errorFromUrl }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(
    errorFromUrl ? (URL_ERRORS[errorFromUrl] ?? null) : null
  )
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    if (redirectTo) formData.append('redirect', redirectTo)

    setError(null)

    startTransition(async () => {
      const result = await signIn(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-10 flex items-center justify-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[420px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-auto">
        <div className="flex flex-col items-center mb-7">
          <div className="relative w-40 h-40 mb-5">
  <Image
    src="/logo.png"
    alt="Ministério Nova Aliança"
    fill
    className="object-contain"
    priority
  />
</div>

          <p className="text-[11px] font-black tracking-[0.28em] uppercase text-brand-400">
            Ministério Nova Aliança
          </p>

          <h1 className="text-[28px] font-black text-white tracking-tight mt-1">
            Entrar
          </h1>

          <p className="text-white/40 text-sm mt-1">
            Bem-vindo de volta à comunidade
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-brand-300/15 bg-white/[0.04] p-5 shadow-[0_0_30px_rgba(59,130,246,0.10),0_20px_70px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/50 to-transparent" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-500/10 blur-2xl" />

          <div className="relative mb-5 rounded-[24px] border border-brand-300/15 bg-brand-500/10 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-500/15 border border-brand-300/20 flex items-center justify-center text-brand-300 shrink-0">
                <Sparkles size={18} />
              </div>

              <div>
                <p className="text-white font-bold text-sm">
                  Acesse sua conta
                </p>

                <p className="text-white/45 text-xs leading-relaxed mt-1">
                  Entre para acompanhar feed, agenda, Bíblia, louvores e Palavra do Dia.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="relative bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form action={handleSubmit} className="relative space-y-4">
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-white/45 mb-2">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="seu@email.com"
                  className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-brand-400/45"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[12px] font-bold uppercase tracking-wider text-white/45">
                  Senha
                </label>

                <Link
                  href="/recuperar-senha"
                  className="text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors"
                >
                  Esqueceu?
                </Link>
              </div>

              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] py-3.5 pl-11 pr-11 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-brand-400/45"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 transition-colors hover:text-white/70"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-14 rounded-2xl border border-brand-300/25 bg-brand-gradient text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_28px_rgba(59,130,246,0.18),0_18px_50px_rgba(0,0,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Entrar
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/40 text-sm mt-6">
          Ainda não tem conta?{' '}
          <Link
            href="/cadastro"
            className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}