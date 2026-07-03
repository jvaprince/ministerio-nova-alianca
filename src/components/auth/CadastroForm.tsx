'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  CheckCircle,
  Ticket,
  Mail,
  User,
  Lock,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { signUp } from '@/lib/auth/actions'
import { createSupabaseClient } from '@/lib/supabase/client'

interface CadastroFormProps {
  inviteToken?: string
}

export default function CadastroForm({ inviteToken }: CadastroFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [token, setToken] = useState(inviteToken ?? '')
  const [tokenName, setTokenName] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [isValidatingToken, setIsValidatingToken] = useState(false)

  useEffect(() => {
    if (inviteToken) validateToken(inviteToken)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteToken])

  async function validateToken(t: string) {
    if (!t.trim()) {
      setTokenName(null)
      setTokenError(null)
      return
    }

    setIsValidatingToken(true)
    setTokenError(null)
    setTokenName(null)

    try {
      const supabase = createSupabaseClient()

      const { data } = await (supabase as any).rpc('validate_invite_token', {
        p_token: t.trim(),
      })

      const result = data as {
        valid?: boolean
        name?: string
        message?: string
      } | null

      if (result?.valid) {
        setTokenName(result.name ?? null)
        setTokenError(null)
      } else {
        setTokenName(null)
        setTokenError(result?.message ?? 'Código inválido.')
      }
    } catch {
      setTokenError('Erro ao validar código. Tente novamente.')
    } finally {
      setIsValidatingToken(false)
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(null)

    if (token.trim()) {
      formData.set('invite_token', token.trim())
    }

    startTransition(async () => {
      const result = await signUp(formData)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(result.message ?? 'Conta criada com sucesso!')
      }
    })
  }

  if (success) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-10 flex items-center justify-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute bottom-20 -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-sm">
          <div className="relative overflow-hidden rounded-[32px] border border-brand-300/15 bg-white/[0.04] p-8 text-center shadow-[0_0_30px_rgba(59,130,246,0.10),0_20px_70px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/50 to-transparent" />

            <div className="relative w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="text-emerald-400" size={32} />
            </div>

            <h2 className="relative text-2xl font-black text-white tracking-tight">
              Conta criada! 🎉
            </h2>

            <p className="relative text-white/50 text-sm mt-3 mb-7 leading-relaxed">
              {success}
            </p>

            <Link
              href="/login"
              className="relative w-full h-14 rounded-2xl bg-brand-gradient text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_28px_rgba(59,130,246,0.18)]"
            >
              Ir para o login
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-10 flex items-center justify-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[420px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
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
            Criar conta
          </h1>

          <p className="text-white/40 text-sm mt-1">
            Entre na comunidade da igreja
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
                  Bem-vindo à Nova Aliança
                </p>

                <p className="text-white/45 text-xs leading-relaxed mt-1">
                  Crie sua conta para acessar feed, agenda, Bíblia, louvores e Palavra do Dia.
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
              <label className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-white/45 mb-2">
                <Ticket size={13} />
                Código de convite
                <span className="text-white/25 normal-case tracking-normal">
                  opcional
                </span>
              </label>

              {tokenName ? (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3">
                  <CheckCircle size={17} className="text-emerald-400 shrink-0" />

                  <div>
                    <p className="text-emerald-400 text-sm font-bold">
                      Olá, {tokenName}!
                    </p>

                    <p className="text-emerald-400/60 text-xs">
                      Sua conta será vinculada ao perfil do ministério.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Ticket
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                  />

                  <input
                    id="invite_token_display"
                    type="text"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value)
                      setTokenName(null)
                      setTokenError(null)
                    }}
                    onBlur={() => validateToken(token)}
                    placeholder="Cole seu código aqui"
                    className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] py-3.5 pl-11 pr-10 text-sm font-mono text-white placeholder:text-white/25 outline-none transition-all focus:border-brand-400/45"
                  />

                  {isValidatingToken && (
                    <Loader2
                      size={15}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 animate-spin"
                    />
                  )}
                </div>
              )}

              {tokenError && (
                <p className="text-red-400 text-xs mt-1.5">{tokenError}</p>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-white/45 mb-2">
                Seu nome
              </label>

              <div className="relative">
                <User
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                />

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  defaultValue={tokenName ?? ''}
                  placeholder={tokenName ? tokenName : 'Como prefere ser chamado'}
                  className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-brand-400/45"
                />
              </div>
            </div>

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
              <label className="block text-[12px] font-bold uppercase tracking-wider text-white/45 mb-2">
                Senha
              </label>

              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
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

              <p className="text-[11px] text-white/28 mt-1.5">
                Use pelo menos 6 caracteres.
              </p>
            </div>

            <input type="hidden" name="invite_token" value={token} />

            <button
              type="submit"
              disabled={isPending || isValidatingToken}
              className="w-full h-14 rounded-2xl border border-brand-300/25 bg-brand-gradient text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_28px_rgba(59,130,246,0.18),0_18px_50px_rgba(0,0,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Criar conta
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/40 text-sm mt-6">
          Já tem uma conta?{' '}
          <Link
            href="/login"
            className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}