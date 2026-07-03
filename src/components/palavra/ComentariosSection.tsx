import { getComentariosPalavra, excluirComentario } from '@/lib/palavra/actions'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Trash2 } from 'lucide-react'

export default async function ComentariosSection({
  palavraId,
}: {
  palavraId: string
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profileData } = user
    ? await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
    : { data: null }

  const profile = profileData as { role?: string } | null

  const comentariosResult = await getComentariosPalavra(palavraId)
  const comentarios = (comentariosResult ?? []) as any[]

  if (comentarios.length === 0) {
    return (
      <p className="text-[13px] text-white/25 py-2">
        Seja o primeiro a comentar. 🙏
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {comentarios.map((c: any) => {
        const podeExcluir =
          c.author_id === user?.id ||
          ['admin', 'leader'].includes(profile?.role ?? '')

        return (
          <div key={c.id} className="flex gap-2 group">
            {c.author?.avatar_url ? (
              <img
                src={c.author.avatar_url}
                alt={c.author.name}
                className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-[11px] font-bold text-white shrink-0 mt-0.5">
                {getInitials(c.author?.name ?? 'NA')}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-[12px] font-semibold text-white">
                  {c.author?.name ?? 'Anônimo'}
                </span>

                <span className="text-[11px] text-white/30">
                  {formatRelativeTime(c.created_at)}
                </span>
              </div>

              <p className="text-[13px] text-white/75 leading-snug">
                {c.content}
              </p>
            </div>

            {podeExcluir && (
              <form action={excluirComentario as any}>
                <input type="hidden" name="commentId" value={c.id} />

                <button
                  type="submit"
                  className="opacity-60 hover:opacity-100 text-white/25 hover:text-red-400 transition-colors p-1"
                  title="Excluir comentário"
                >
                  <Trash2 size={13} />
                </button>
              </form>
            )}
          </div>
        )
      })}
    </div>
  )
}