import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  Crown,
  Sparkles,
  User,
  Plus,
  Trash2,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getInitials } from '@/lib/utils'
import {
  atualizarCargoMembro,
  atualizarCargoConvite,
  criarConvite,
  excluirConvite,
} from '@/lib/admin/actions'

export const metadata: Metadata = {
  title: 'Membros — Admin Nova Aliança',
}

function roleLabel(role?: string | null) {
  if (role === 'admin') return 'Admin'
  if (role === 'leader') return 'Líder'
  return 'Membro'
}

function roleIcon(role?: string | null) {
  if (role === 'admin') return <Crown size={15} className="text-amber-300" />
  if (role === 'leader') return <Sparkles size={15} className="text-brand-300" />
  return <User size={15} className="text-white/45" />
}

function roleStyle(role?: string | null) {
  if (role === 'admin') {
    return 'bg-amber-300/10 text-amber-300 border-amber-300/25'
  }

  if (role === 'leader') {
    return 'bg-brand-500/15 text-brand-300 border-brand-300/25'
  }

  return 'bg-white/[0.04] text-white/45 border-white/10'
}

export default async function MembrosPage() {
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

  const { data: membros } = await supabase
    .from('profiles')
    .select('id, name, username, avatar_url, role, joined_at')
    .order('name')

  const { data: convites } = await supabase
    .from('pending_profiles')
    .select('id, name, role, invite_token, is_linked, linked_at')
    .order('name')

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-52 text-white">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
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
              Membros
            </h1>
          </div>
        </div>

        <form
          action={criarConvite}
          className="relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] p-4 shadow-[0_0_24px_rgba(59,130,246,0.08),0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl mb-7"
        >
          <div className="flex items-center gap-2 mb-4">
            <Plus size={16} className="text-brand-300" />

            <p className="text-[12px] font-black uppercase tracking-[0.22em] text-brand-300">
              Novo convite
            </p>
          </div>

          <div className="space-y-3">
            <input
              name="name"
              required
              placeholder="Nome da pessoa"
              className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-400/45"
            />

            <select
              name="role"
              defaultValue="member"
              className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none focus:border-brand-400/45"
            >
              <option value="member" className="text-black">
                Membro
              </option>
              <option value="leader" className="text-black">
                Líder
              </option>
              <option value="admin" className="text-black">
                Admin
              </option>
            </select>

            <button
              type="submit"
              className="w-full rounded-2xl border border-brand-300/25 bg-brand-gradient py-3.5 text-sm font-bold text-white transition-all active:scale-[0.98]"
            >
              Criar convite
            </button>
          </div>
        </form>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-black">
              Contas criadas
            </h2>

            <p className="text-xs text-white/35">
              {membros?.length ?? 0} membros
            </p>
          </div>

          <div className="space-y-3">
            {membros?.map((membro: any) => (
              <div
                key={membro.id}
                className="relative overflow-hidden rounded-[24px] border border-brand-300/15 bg-white/[0.04] p-4 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  {membro.avatar_url ? (
                    <img
                      src={membro.avatar_url}
                      alt={membro.name}
                      className="w-12 h-12 rounded-2xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center text-sm font-black text-white shrink-0">
                      {getInitials(membro.name ?? 'NA')}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-white truncate">
                      {membro.name}
                    </p>

                    <p className="text-[12px] text-white/40 truncate">
                      {membro.username ? `@${membro.username}` : 'Sem username'}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${roleStyle(
                      membro.role
                    )}`}
                  >
                    {roleIcon(membro.role)}
                    {roleLabel(membro.role)}
                  </span>
                </div>

                <form action={atualizarCargoMembro} className="mt-4 flex gap-2">
                  <input type="hidden" name="user_id" value={membro.id} />

                  <select
                    name="role"
                    defaultValue={membro.role ?? 'member'}
                    className="flex-1 rounded-2xl border border-brand-300/15 bg-white/[0.05] px-3 py-3 text-xs text-white outline-none"
                  >
                    <option value="member" className="text-black">
                      Membro
                    </option>
                    <option value="leader" className="text-black">
                      Líder
                    </option>
                    <option value="admin" className="text-black">
                      Admin
                    </option>
                  </select>

                  <button
                    type="submit"
                    className="rounded-2xl bg-brand-500/20 border border-brand-300/20 px-4 text-xs font-bold text-brand-300 active:scale-95"
                  >
                    Salvar
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-black">
              Convites
            </h2>

            <p className="text-xs text-white/35">
              {convites?.filter((c: any) => !c.is_linked).length ?? 0} pendentes
            </p>
          </div>

          <div className="space-y-3">
            {convites?.map((convite: any) => {
              const link = `http://localhost:3000/cadastro?convite=${convite.invite_token}`

              return (
                <div
                  key={convite.id}
                  className={`relative overflow-hidden rounded-[24px] border p-4 backdrop-blur-xl ${
                    convite.is_linked
                      ? 'border-emerald-300/15 bg-emerald-500/5'
                      : 'border-brand-300/15 bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                      {roleIcon(convite.role)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">
                        {convite.name}
                      </p>

                      <p className="text-xs text-white/40 mt-0.5">
                        {convite.is_linked ? 'Conta vinculada' : 'Aguardando cadastro'}
                      </p>

                      {!convite.is_linked && (
                        <p className="text-[11px] text-brand-300/80 mt-2 break-all">
                          {link}
                        </p>
                      )}
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${roleStyle(
                        convite.role
                      )}`}
                    >
                      {roleLabel(convite.role)}
                    </span>
                  </div>

                  {!convite.is_linked && (
                    <div className="mt-4 flex gap-2">
                      <form action={atualizarCargoConvite} className="flex flex-1 gap-2">
                        <input type="hidden" name="pending_id" value={convite.id} />

                        <select
                          name="role"
                          defaultValue={convite.role ?? 'member'}
                          className="flex-1 rounded-2xl border border-brand-300/15 bg-white/[0.05] px-3 py-3 text-xs text-white outline-none"
                        >
                          <option value="member" className="text-black">
                            Membro
                          </option>
                          <option value="leader" className="text-black">
                            Líder
                          </option>
                          <option value="admin" className="text-black">
                            Admin
                          </option>
                        </select>

                        <button
                          type="submit"
                          className="rounded-2xl bg-brand-500/20 border border-brand-300/20 px-4 text-xs font-bold text-brand-300 active:scale-95"
                        >
                          Salvar
                        </button>
                      </form>

                      <form action={excluirConvite}>
                        <input type="hidden" name="pending_id" value={convite.id} />

                        <button
                          type="submit"
                          className="h-full rounded-2xl bg-red-500/10 border border-red-400/20 px-3 text-red-400 active:scale-95"
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}