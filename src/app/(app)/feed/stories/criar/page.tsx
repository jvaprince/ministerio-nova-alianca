import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import BackButton from '@/components/ui/BackButton'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import CreateStoryForm from '@/components/feed/CreateStoryForm'

export const metadata: Metadata = {
  title: 'Criar story — Ministério Nova Aliança',
}

export default async function CriarStoryPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="relative min-h-screen overflow-hidden pb-8 bg-[#050816]">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-4 pt-10 pb-5">
          <BackButton href="/feed" />

          <div className="mt-4">
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35">
              Stories
            </p>

            <h1 className="text-[26px] font-black text-white tracking-tight mt-1">
              Novo story
            </h1>
          </div>
        </div>

        <CreateStoryForm />
      </div>
    </div>
  )
}