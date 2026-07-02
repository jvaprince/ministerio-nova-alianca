import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  Shield,
  MessageCircle,
  Image as ImageIcon,
  Video,
  Trash2,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { excluirPostAdmin } from '@/lib/admin/actions'

export const metadata: Metadata = {
  title: 'Moderação — Admin Nova Aliança',
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminModeracaoPage() {
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

  const { data: posts } = await supabase
    .from('feed_posts')
    .select(`
      id,
      content,
      image_url,
      video_url,
      post_type,
      created_at,
      author:profiles (
        name,
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-52 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-red-400/10 blur-3xl" />
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
              Moderação
            </h1>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-red-300/15 bg-red-500/5 p-4 mb-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-400/20 flex items-center justify-center">
              <Shield size={20} className="text-red-300" />
            </div>

            <div>
              <p className="text-sm font-bold text-white">
                Área sensível
              </p>

              <p className="text-xs text-white/45 mt-1">
                Aqui você pode remover publicações inadequadas do feed.
              </p>
            </div>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-black">
              Publicações recentes
            </h2>

            <p className="text-xs text-white/35">
              {posts?.length ?? 0} itens
            </p>
          </div>

          <div className="space-y-4">
            {posts?.map((post: any) => {
              const author = Array.isArray(post.author)
                ? post.author[0]
                : post.author

              return (
                <div
                  key={post.id}
                  className="relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      {author?.avatar_url ? (
                        <img
                          src={author.avatar_url}
                          alt={author.name}
                          className="w-11 h-11 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-brand-gradient flex items-center justify-center text-sm font-black">
                          {(author?.name ?? 'NA').slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">
                          {author?.name ?? 'Usuário'}
                        </p>

                        <p className="text-xs text-white/40 truncate">
                          @{author?.username ?? 'sem-username'} · {formatDate(post.created_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-white/35">
                        {post.image_url && <ImageIcon size={16} />}
                        {post.video_url && <Video size={16} />}
                        {!post.image_url && !post.video_url && <MessageCircle size={16} />}
                      </div>
                    </div>

                    {post.content && (
                      <p className="text-sm text-white/75 leading-relaxed mt-4 whitespace-pre-line">
                        {post.content}
                      </p>
                    )}
                  </div>

                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Imagem da publicação"
                      className="w-full max-h-[360px] object-cover border-t border-white/[0.06]"
                    />
                  )}

                  {post.video_url && (
                    <video
                      src={post.video_url}
                      controls
                      playsInline
                      className="w-full max-h-[360px] object-cover border-t border-white/[0.06] bg-black"
                    />
                  )}

                  <form action={excluirPostAdmin} className="p-4 border-t border-white/[0.06]">
                    <input type="hidden" name="post_id" value={post.id} />

                    <button
                      type="submit"
                      className="w-full rounded-2xl border border-red-400/20 bg-red-500/10 py-3 text-sm font-bold text-red-400 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                    >
                      <Trash2 size={16} />
                      Excluir publicação
                    </button>
                  </form>
                </div>
              )
            })}

            {(!posts || posts.length === 0) && (
              <div className="rounded-[28px] border border-brand-300/15 bg-white/[0.04] p-8 text-center">
                <Shield size={28} className="mx-auto text-white/25 mb-3" />
                <p className="text-white/45 text-sm">
                  Nenhuma publicação encontrada.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}