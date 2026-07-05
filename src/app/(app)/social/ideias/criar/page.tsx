import Link from 'next/link'
import { createSocialIdea } from '@/lib/social/actions'
import { ArrowLeft, Lightbulb, Send, Sparkles } from 'lucide-react'

export default function CriarIdeiaPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070707] px-4 pb-40 pt-6 text-white">
      <div className="pointer-events-none absolute right-0 top-0 h-[360px] w-[360px] rounded-full bg-[#E4572E]/20 blur-[120px]" />

      <section className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-5">
        <Link
          href="/social/ideias"
          className="inline-flex w-fit items-center gap-2 text-sm font-bold text-white/45 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Voltar para ideias
        </Link>

        <div className="rounded-[2rem] border border-white/10 bg-[#111111] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E4572E]/30 bg-[#E4572E]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#FF6B35]">
            <Sparkles size={15} />
            Nova sugestão
          </div>

          <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-[-0.05em] md:text-6xl">
            Comece uma ação com uma ideia
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-white/55">
            Descreva uma causa, necessidade, instituição ou oportunidade de
            serviço. A liderança poderá analisar, desenvolver e transformar essa
            sugestão em projeto.
          </p>
        </div>

        <form
          action={createSocialIdea}
          className="rounded-[2rem] border border-white/10 bg-[#111111] p-5"
        >
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                Título da ideia
              </span>
              <input
                name="title"
                required
                placeholder="Ex: Campanha do agasalho"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                Categoria
              </span>
              <select
                name="category"
                defaultValue="outro"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="familia">Família</option>
                <option value="pessoa">Pessoa</option>
                <option value="ong">ONG</option>
                <option value="asilo">Asilo</option>
                <option value="orfanato">Orfanato</option>
                <option value="hospital">Hospital</option>
                <option value="escola">Escola</option>
                <option value="comunidade">Comunidade</option>
                <option value="projeto_social">Projeto social</option>
                <option value="outro">Outro</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                Descrição
              </span>
              <textarea
                name="description"
                rows={5}
                placeholder="Explique quem seria ajudado, qual necessidade existe e por que essa ideia seria importante..."
                className="resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-relaxed text-white outline-none placeholder:text-white/30"
              />
            </label>

            <div className="rounded-3xl border border-[#E4572E]/20 bg-[#E4572E]/[0.06] p-4">
              <div className="flex gap-3">
                <Lightbulb className="mt-1 text-[#FF6B35]" size={20} />
                <p className="text-sm leading-relaxed text-white/55">
                  Não precisa estar tudo pronto. Uma boa ideia pode começar
                  simples e depois ser desenvolvida pela liderança.
                </p>
              </div>
            </div>

            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#E4572E] px-5 text-sm font-bold text-white shadow-[0_0_30px_rgba(228,87,46,0.35)] transition hover:bg-[#FF6B35]">
              <Send size={16} />
              Enviar ideia para análise
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}