import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getPalavraById, editarPalavra } from '@/lib/palavra/actions'
import VersiculoSelector from '@/components/perfil/VersiculoSelector'
import BackButton from '@/components/ui/BackButton'

export const metadata: Metadata = {
  title: 'Editar Palavra do Dia',
}

export default async function EditarPalavraPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile as { role?: string } | null)?.role

  if (!['admin', 'leader'].includes(role ?? '')) redirect('/palavra')

  const palavraResult = await getPalavraById(params.id)
  const palavra = palavraResult as any

  if (!palavra) redirect('/palavra')

  if (palavra.responsible_id !== user.id && role !== 'admin') {
    redirect('/palavra')
  }

  const editarComId = editarPalavra.bind(null, params.id) as any

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] pb-8">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-4 pt-10 pb-5">
          <BackButton href="/palavra" />

          <div className="mt-4">
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35">
              Palavra do Dia
            </p>

            <h1 className="text-[26px] font-black text-white tracking-tight mt-1">
              Editar
            </h1>
          </div>
        </div>

        <form action={editarComId} className="px-4 pt-2 space-y-4">
          <VersiculoSelector
            initialVerse={palavra.verse}
            initialRef={palavra.verse_ref}
            verseName="verse"
            refName="verse_ref"
            label="Versículo do dia"
          />

          <div>
            <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
              Reflexão
            </label>

            <textarea
              name="reflection"
              rows={5}
              defaultValue={palavra.reflection ?? ''}
              placeholder="Escreva sua reflexão..."
              className="w-full resize-none rounded-[24px] border border-brand-300/15 bg-white/[0.05] px-4 py-4 text-white text-sm placeholder:text-white/25 outline-none focus:border-brand-400/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
              Link de Vídeo
            </label>

            <input
              name="video_url"
              type="url"
              defaultValue={palavra.video_url ?? ''}
              placeholder="https://youtube.com/..."
              className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white text-sm placeholder:text-white/25 outline-none focus:border-brand-400/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            />
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-brand-300/10 bg-white/[0.04] p-4 transition-all active:scale-[0.98]">
            <input
              name="is_published"
              type="checkbox"
              id="is_published"
              value="true"
              defaultChecked={palavra.is_published}
              className="mt-1 h-4 w-4 accent-brand-500"
            />

            <div>
              <p className="text-white font-semibold text-sm">
                Publicado
              </p>

              <p className="text-white/40 text-xs mt-1">
                Desmarque para ocultar temporariamente esta Palavra.
              </p>
            </div>
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl border border-brand-300/25 bg-brand-gradient py-4 text-sm font-bold text-white shadow-[0_0_28px_rgba(59,130,246,0.18),0_18px_50px_rgba(0,0,0,0.25)] transition-all active:scale-[0.98]"
          >
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  )
}