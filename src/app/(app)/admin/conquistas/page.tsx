import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  Trophy,
  Crown,
  Sparkles,
  Medal,
  Plus,
  Trash2,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  criarConquistaAdmin,
  excluirConquistaAdmin,
} from '@/lib/admin/actions'

export const metadata: Metadata = {
  title: 'Conquistas — Admin Nova Aliança',
}

function rarityLabel(rarity?: string | null) {
  if (rarity === 'legendary') return 'Lendária'
  if (rarity === 'epic') return 'Épica'
  if (rarity === 'rare') return 'Rara'
  return 'Comum'
}

function rarityStyle(rarity?: string | null, isSuper?: boolean) {
  if (isSuper || rarity === 'legendary') {
    return 'border-amber-300/25 bg-amber-300/10 text-amber-300'
  }

  if (rarity === 'epic') {
    return 'border-purple-300/25 bg-purple-500/10 text-purple-300'
  }

  if (rarity === 'rare') {
    return 'border-cyan-300/25 bg-cyan-500/10 text-cyan-300'
  }

  return 'border-brand-300/20 bg-brand-500/10 text-brand-300'
}

function rarityIcon(rarity?: string | null, isSuper?: boolean) {
  if (isSuper || rarity === 'legendary') return <Crown size={15} />
  if (rarity === 'epic') return <Sparkles size={15} />
  if (rarity === 'rare') return <Medal size={15} />
  return <Trophy size={15} />
}

export default async function AdminConquistasPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .maybeSingle()

const role = (myProfile as { role?: string } | null)?.role

if (role !== 'admin') redirect('/inicio')

  const { data: conquistas } = await supabase
    .from('achievements')
    .select('id, title, description, icon, code, rarity, is_super, created_at')
    .order('is_super', { ascending: false })
    .order('created_at', { ascending: true })

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-52 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-7">
          <Link
            href="/admin"
            className="w-11 h-11 rounded-full border border-brand-300/20 bg-white/[0.04] flex items-center justify-center text-brand-300 backdrop-blur-xl active:scale-95 transition-all"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
              Painel Admin
            </p>

            <h1 className="text-[28px] font-black tracking-tight">
              Conquistas
            </h1>
          </div>
        </div>

        <form
          action={criarConquistaAdmin}
          className="relative overflow-hidden rounded-[28px] border border-amber-300/15 bg-amber-500/5 p-4 shadow-[0_0_24px_rgba(251,191,36,0.08),0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl mb-7"
        >
          <div className="flex items-center gap-2 mb-4">
            <Plus size={16} className="text-amber-300" />

            <p className="text-[12px] font-black uppercase tracking-[0.22em] text-amber-300">
              Nova conquista
            </p>
          </div>

          <div className="space-y-3">
            <input
              name="title"
              required
              placeholder="Título da conquista"
              className="w-full rounded-2xl border border-amber-300/15 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-amber-300/45"
            />

            <input
              name="code"
              required
              placeholder="Código único. Ex: streak_7"
              className="w-full rounded-2xl border border-amber-300/15 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-amber-300/45"
            />

            <input
              name="icon"
              placeholder="Ícone. Ex: 🔥"
              maxLength={4}
              className="w-full rounded-2xl border border-amber-300/15 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-amber-300/45"
            />

            <textarea
              name="description"
              required
              rows={3}
              placeholder="Descrição da conquista"
              className="w-full resize-none rounded-2xl border border-amber-300/15 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-amber-300/45"
            />

            <select
              name="rarity"
              defaultValue="common"
              className="w-full rounded-2xl border border-amber-300/15 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/45"
            >
              <option value="common" className="text-black">
                Comum
              </option>
              <option value="rare" className="text-black">
                Rara
              </option>
              <option value="epic" className="text-black">
                Épica
              </option>
              <option value="legendary" className="text-black">
                Lendária
              </option>
            </select>

            <label className="flex items-start gap-3 rounded-2xl border border-amber-300/10 bg-white/[0.04] p-4">
              <input
                name="is_super"
                type="checkbox"
                value="true"
                className="mt-1 h-4 w-4 accent-amber-400"
              />

              <div>
                <p className="text-sm font-bold text-white">
                  Super conquista
                </p>

                <p className="text-xs text-white/40 mt-1">
                  Use para conquistas especiais, como Top 1 do mês.
                </p>
              </div>
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl border border-amber-300/25 bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 py-3.5 text-sm font-black text-black transition-all active:scale-[0.98]"
            >
              Criar conquista
            </button>
          </div>
        </form>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-black">
              Cadastradas
            </h2>

            <p className="text-xs text-white/35">
              {conquistas?.length ?? 0} conquistas
            </p>
          </div>

          <div className="space-y-3">
            {conquistas?.map((conquista: any) => (
              <div
                key={conquista.id}
                className="relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] p-4 shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              >
                <div className="flex items-start gap-3">
                  <div className="w-13 h-13 min-w-13 h-[52px] w-[52px] rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-2xl">
                    {conquista.icon ?? '🏆'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-black text-white">
                        {conquista.title}
                      </h2>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${rarityStyle(
                          conquista.rarity,
                          conquista.is_super
                        )}`}
                      >
                        {rarityIcon(conquista.rarity, conquista.is_super)}
                        {rarityLabel(conquista.rarity)}
                      </span>
                    </div>

                    <p className="text-xs text-white/35 mt-1 break-all">
                      {conquista.code}
                    </p>

                    <p className="text-sm text-white/55 leading-relaxed mt-2">
                      {conquista.description}
                    </p>
                  </div>
                </div>

                <form action={excluirConquistaAdmin} className="mt-4">
                  <input type="hidden" name="achievement_id" value={conquista.id} />

                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-red-400/20 bg-red-500/10 py-3 text-xs font-bold text-red-400 flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Trash2 size={14} />
                    Excluir conquista
                  </button>
                </form>
              </div>
            ))}

            {(!conquistas || conquistas.length === 0) && (
              <div className="rounded-[28px] border border-brand-300/15 bg-white/[0.04] p-8 text-center">
                <Trophy size={28} className="mx-auto text-white/25 mb-3" />
                <p className="text-white/45 text-sm">
                  Nenhuma conquista cadastrada.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}