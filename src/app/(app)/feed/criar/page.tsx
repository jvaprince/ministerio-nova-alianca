import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import BackButton from '@/components/ui/BackButton'
import CreatePostForm from '@/components/feed/CreatePostForm'
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

        <CreatePostForm
  initialContent={initialContent}
  initialPostType={initialPostType}
/>
      </div>
    </div>
  )
}