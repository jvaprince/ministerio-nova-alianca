import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import BackButton from '@/components/ui/BackButton'
import FeedMediaUpload from '@/components/feed/FeedMediaUpload'
import { criarPostFeed } from '@/lib/feed/actions'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Criar publicação — Ministério Nova Aliança',
}

export default async function CriarPostFeedPage({
  searchParams,
}: {
  searchParams?: {
    content?: string
    post_type?: string
  }
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const initialContent = searchParams?.content ?? ''
  const initialPostType = searchParams?.post_type ?? 'outro'

  return (
    <div className="relative min-h-screen overflow-hidden pb-8 bg-[#050816]">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-4 pt-12 pb-5 border-b border-white/[0.06]">
          <BackButton href="/feed" />

          <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35 mt-6">
            Feed da Igreja
          </p>

          <h1 className="text-[26px] font-black text-white tracking-tight">
            Nova publicação
          </h1>
        </div>

        <form action={criarPostFeed as any} className="px-4 pt-5 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-white/50 uppercase tracking-wider mb-2">
              Tipo de publicação
            </label>

            <select
              name="post_type"
              defaultValue={initialPostType}
              className="w-full bg-white/[0.05] border border-brand-300/15 rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-brand-400/40"
            >
              <option value="aviso" className="text-black">Aviso</option>
              <option value="foto" className="text-black">Foto</option>
              <option value="testemunho" className="text-black">Testemunho</option>
              <option value="reflexao" className="text-black">Reflexão</option>
              <option value="outro" className="text-black">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-white/50 uppercase tracking-wider mb-2">
              Texto
            </label>

            <textarea
              name="content"
              rows={6}
              defaultValue={initialContent}
              placeholder="Compartilhe um aviso, testemunho, reflexão ou algo especial..."
              className="w-full bg-white/[0.05] border border-brand-300/15 rounded-[24px] px-4 py-4 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-brand-400/40 resize-none shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            />
          </div>

          <FeedMediaUpload />

          <p className="text-[11px] text-white/35">
            Você pode publicar texto, imagem ou vídeo.
          </p>

          <button
            type="submit"
            className="w-full rounded-2xl border border-brand-300/25 bg-brand-gradient text-white font-bold py-4 text-sm shadow-[0_0_28px_rgba(59,130,246,0.18),0_18px_50px_rgba(0,0,0,0.25)] transition-all active:scale-[0.98]"
          >
            Publicar
          </button>
        </form>
      </div>
    </div>
  )
}