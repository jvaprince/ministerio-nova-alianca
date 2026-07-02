import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Edit2,
  Eye,
  Plus,
  Trash2,
  Video,
  Mic,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { excluirPalavraAdmin } from '@/lib/admin/actions'

export const metadata: Metadata = {
  title: 'Palavra do Dia — Admin Nova Aliança',
}

function formatDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export default async function AdminPalavraPage() {
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

  const { data: palavras } = await supabase
    .from('daily_words')
    .select(`
      id,
      scheduled_date,
      verse,
      verse_ref,
      reflection,
      video_url,
      audio_url,
      is_published,
      created_at,
      responsible:profiles (
        name,
        username,
        avatar_url
      )
    `)
    .order('scheduled_date', { ascending: false })
    .limit(50)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-52 text-white">
      <div className="pointer-events-none absolute inset-0">
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
              Palavra do Dia
            </h1>
          </div>
        </div>

        <Link
          href="/palavra/criar"
          className="mb-6 flex items-center justify-center gap-2 rounded-2xl border border-brand-300/25 bg-brand-gradient py-4 text-sm font-bold text-white active:scale-[0.98] transition-all"
        >
          <Plus size={17} />
          Criar Palavra
        </Link>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-black">
              Palavras cadastradas
            </h2>

            <p className="text-xs text-white/35">
              {palavras?.length ?? 0} itens
            </p>
          </div>

          <div className="space-y-4">
            {palavras?.map((palavra: any) => {
              const responsible = Array.isArray(palavra.responsible)
                ? palavra.responsible[0]
                : palavra.responsible

              return (
                <div
                  key={palavra.id}
                  className="relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-black tracking-[0.22em] uppercase text-brand-400">
                          {palavra.is_published ? 'Publicada' : 'Rascunho'}
                        </p>

                        <h2 className="text-xl font-black mt-2">
                          {palavra.verse_ref ?? 'Sem referência'}
                        </h2>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                          palavra.is_published
                            ? 'border-emerald-300/20 bg-emerald-500/10 text-emerald-300'
                            : 'border-yellow-300/20 bg-yellow-500/10 text-yellow-300'
                        }`}
                      >
                        {palavra.is_published ? 'Online' : 'Oculta'}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-white/55">
                      <Calendar size={15} className="text-brand-300" />
                      {formatDate(palavra.scheduled_date)}
                    </div>

                    {responsible && (
                      <p className="text-xs text-white/40 mt-2">
                        Responsável: {responsible.name ?? responsible.username}
                      </p>
                    )}

                    {palavra.verse && (
                      <p className="text-sm text-white/75 italic leading-relaxed mt-4">
                        &quot;{palavra.verse}&quot;
                      </p>
                    )}

                    {palavra.reflection && (
                      <p className="text-sm text-white/55 leading-relaxed mt-3 line-clamp-4">
                        {palavra.reflection}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      {palavra.video_url && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] border border-white/10 px-3 py-1 text-xs text-white/50">
                          <Video size={13} />
                          Vídeo
                        </span>
                      )}

                      {palavra.audio_url && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] border border-white/10 px-3 py-1 text-xs text-white/50">
                          <Mic size={13} />
                          Áudio
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-4 border-t border-white/[0.06]">
                    <Link
                      href={`/palavra/${palavra.id}`}
                      className="rounded-2xl border border-brand-300/20 bg-brand-500/10 py-3 text-xs font-bold text-brand-300 flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      <Eye size={14} />
                      Ver
                    </Link>

                    <Link
                      href={`/palavra/editar/${palavra.id}`}
                      className="rounded-2xl border border-brand-300/20 bg-white/[0.04] py-3 text-xs font-bold text-white/65 flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      <Edit2 size={14} />
                      Editar
                    </Link>

                    <form action={excluirPalavraAdmin}>
                      <input type="hidden" name="palavra_id" value={palavra.id} />

                      <button
                        type="submit"
                        className="w-full rounded-2xl border border-red-400/20 bg-red-500/10 py-3 text-xs font-bold text-red-400 flex items-center justify-center gap-1.5 active:scale-[0.98]"
                      >
                        <Trash2 size={14} />
                        Excluir
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}

            {(!palavras || palavras.length === 0) && (
              <div className="rounded-[28px] border border-brand-300/15 bg-white/[0.04] p-8 text-center">
                <BookOpen size={28} className="mx-auto text-white/25 mb-3" />
                <p className="text-white/45 text-sm">
                  Nenhuma Palavra cadastrada.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}