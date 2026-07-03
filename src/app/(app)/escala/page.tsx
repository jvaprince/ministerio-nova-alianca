import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getEscala, gerarEscalaAutomatica } from '@/lib/palavra/actions'
import { getInitials, formatDateShort } from '@/lib/utils'

export const metadata: Metadata = { title: 'Escala — Ministério Nova Aliança' }

export default async function EscalaPage() {
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

  if (!['admin', 'leader'].includes(role ?? '')) redirect('/inicio')

  const escala = (await getEscala(30)) as any[]

  return (
    <div className="pb-6">
      <div className="px-4 pt-12 pb-4">
        <p className="text-[11px] font-bold tracking-widest uppercase text-white/30">
          Escala
        </p>

        <h1 className="text-[22px] font-bold text-white">
          Próximos 30 dias
        </h1>
      </div>

      <form
        action={async () => {
          'use server'

          const result = await gerarEscalaAutomatica(
            new Date().toISOString().split('T')[0],
            30
          )

          console.log('GERAR ESCALA RESULT:', result)
        }}
      >
        <button
          type="submit"
          className="mt-4 w-full bg-brand-gradient text-white font-semibold py-3 rounded-xl text-sm"
        >
          Gerar escala automática
        </button>
      </form>

      <div className="px-4 space-y-2">
        {escala.length === 0 && (
          <p className="text-white/40 text-sm py-8 text-center">
            Nenhuma escala gerada.
          </p>
        )}

        {escala.map((item: any) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 bg-white/[0.04] border border-white/[0.07] rounded-2xl"
          >
            {item.user?.avatar_url && item.pending_profile?.linked_user_id ? (
              <img
                src={item.user.avatar_url}
                alt={item.user.name}
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-sm font-bold text-white shrink-0">
                {getInitials(item.user?.name ?? 'NA')}
              </div>
            )}

            <div className="flex-1">
              <p className="text-[14px] font-semibold text-white">
                {item.pending_profile?.name ?? item.user?.name ?? 'Sem responsável'}
              </p>

              <p className="text-[12px] text-white/40">
                {formatDateShort(item.scheduled_date)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}