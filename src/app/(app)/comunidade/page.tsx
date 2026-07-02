import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import CommunitySearch from '@/components/comunidade/CommunitySearch'

export const metadata: Metadata = {
  title: 'Comunidade — Ministério Nova Aliança',
}

export default async function ComunidadePage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, username, avatar_url, role')
    .not('username', 'is', null)
    .order('name', { ascending: true })

  return (
    <div className="pb-8">
      <div className="px-4 pt-12 pb-5">
        <p className="text-[11px] font-bold tracking-widest uppercase text-white/30">
          Ministério Nova Aliança
        </p>

        <h1 className="text-[22px] font-bold text-white">Comunidade</h1>

        <p className="text-[13px] text-white/40 mt-1">
          Encontre pessoas e conheça melhor os membros.
        </p>
      </div>

      <CommunitySearch profiles={profiles ?? []} />
    </div>
  )
}