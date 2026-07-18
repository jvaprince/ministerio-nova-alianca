import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { criarPalavra } from '@/lib/palavra/actions'
import VersiculoSelector from '@/components/perfil/VersiculoSelector'
import BackButton from '@/components/ui/BackButton'
import PalavraMediaRecorder from '@/components/palavra/PalavraMediaRecorder'

export const metadata: Metadata = {
  title: 'Criar Palavra do Dia',
}

export default async function CriarPalavraPage() {
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

const today = new Date().toISOString().split('T')[0]

const { getResponsavelPalavra } = await import('@/lib/palavra/actions')

const responsavelHoje = await getResponsavelPalavra(today)

const podePublicar =
  role === 'admin' ||
  responsavelHoje?.user?.id === user.id ||
  responsavelHoje?.pending_profile?.linked_user_id === user.id

if (!podePublicar) {
  redirect('/palavra')
}

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
              Publicar
            </h1>
          </div>
        </div>

        <form action={criarPalavra as any} className="px-4 pt-2 space-y-4">
          <div>
            <label className="block text-[12px] font-black tracking-widest uppercase text-white/35 mb-2">
              Data *
            </label>

            <input
              name="scheduled_date"
              type="date"
              defaultValue={today}
              required
              className="w-full rounded-2xl border border-brand-300/15 bg-white/[0.05] px-4 py-3.5 text-white text-sm outline-none focus:border-brand-400/45"
            />
          </div>

          <VersiculoSelector
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
              placeholder="Escreva sua reflexão..."
              className="w-full resize-none rounded-[24px] border border-brand-300/15 bg-white/[0.05] px-4 py-4 text-white text-sm placeholder:text-white/25 outline-none focus:border-brand-400/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            />
          </div>

          <PalavraMediaRecorder />

          <label className="flex items-start gap-3 rounded-2xl border border-brand-300/10 bg-white/[0.04] p-4 transition-all active:scale-[0.98]">
            <input
              name="is_published"
              type="checkbox"
              id="is_published"
              value="true"
              className="mt-1 h-4 w-4 accent-brand-500"
            />

            <div>
              <p className="text-white font-semibold text-sm">
                Publicar imediatamente
              </p>

              <p className="text-white/40 text-xs mt-1">
                Se desmarcado, a Palavra ficará salva para a data escolhida.
              </p>
            </div>
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl border border-brand-300/25 bg-brand-gradient py-4 text-sm font-bold text-white shadow-[0_0_28px_rgba(59,130,246,0.18),0_18px_50px_rgba(0,0,0,0.25)] transition-all active:scale-[0.98]"
          >
            Publicar Palavra do Dia
          </button>
        </form>
      </div>
    </div>
  )
}