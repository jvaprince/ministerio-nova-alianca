import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  ArrowLeft,
  Calendar,
  Package,
} from 'lucide-react'
import { notFound } from 'next/navigation'
import ProjectSetupSection from '@/components/social/ProjectSetupSection'

const statusLabel: Record<string, string> = {
  planned: 'Em estruturação',
  active: 'Campanha ativa',
  completed: 'Finalizado',
}

export default async function SocialProjetoDetalhePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createSupabaseServerClient()

  const { data: project } = await supabase
    .from('social_projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!project) notFound()

  const completedSteps = [
    !!project.beneficiary_name,
    false,
    false,
    !!project.start_date,
  ].filter(Boolean).length

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070707] px-4 pb-40 pt-6 text-white">
      <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#E4572E]/25 blur-[130px]" />

      <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-5">
        <div className="flex items-center justify-between">
          <Link
            href="/social/projetos"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition hover:bg-white/[0.1] hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>

          <span className="rounded-full border border-[#E4572E]/25 bg-[#E4572E]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#FF6B35]">
            {statusLabel[project.status] ?? project.status}
          </span>
        </div>

        <header>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-white/35">
            Projeto Nova Aliança
          </p>

          <h1 className="text-5xl font-black uppercase leading-[0.88] tracking-[-0.07em] md:text-7xl">
            {project.title}
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/55">
            {project.description ||
              'Este projeto ainda está sendo estruturado antes de ser publicado para toda a igreja.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/45">
            <span className="inline-flex items-center gap-2">
              <Calendar size={16} className="text-[#FF6B35]" />
              Criado em{' '}
              {new Date(project.created_at).toLocaleDateString('pt-BR')}
            </span>

            <span className="inline-flex items-center gap-2">
              <Package size={16} className="text-[#FF6B35]" />
              {project.beneficiary_type || 'Tipo não definido'}
            </span>
          </div>
        </header>

        <div className="rounded-[2rem] border border-[#E4572E]/20 bg-[#111111] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6B35]">
                Estruturação
              </p>

              <h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.04em]">
                {completedSteps}/4 etapas concluídas
              </h2>

              <p className="mt-2 text-sm text-white/50">
                Complete as etapas abaixo antes de publicar a campanha.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E4572E]/20 bg-[#E4572E]/10 px-5 py-4 text-center">
              <strong className="block text-2xl font-black text-[#FF6B35]">
                {completedSteps}/4
              </strong>

              <span className="text-xs text-white/50">
                concluído
              </span>
            </div>
          </div>
        </div>

        <ProjectSetupSection
          title="Beneficiado"
          subtitle={
            project.beneficiary_name
              ? `${project.beneficiary_name} • ${project.beneficiary_type}`
              : 'Ainda não configurado'
          }
          completed={!!project.beneficiary_name}
        >
          <p className="text-sm text-white/50">
            Defina quem será ajudado pela campanha.
          </p>
        </ProjectSetupSection>

        <ProjectSetupSection
          title="Necessidades"
          subtitle="Nenhuma necessidade cadastrada"
          completed={false}
        >
          <p className="text-sm text-white/50">
            Adicione itens e metas de arrecadação.
          </p>
        </ProjectSetupSection>

        <ProjectSetupSection
          title="Participação"
          subtitle="Nenhuma forma de ajuda definida"
          completed={false}
        >
          <p className="text-sm text-white/50">
            Configure como os membros poderão participar.
          </p>
        </ProjectSetupSection>

        <ProjectSetupSection
          title="Datas"
          subtitle={
            project.start_date
              ? `${project.start_date} até ${project.end_date}`
              : 'Ainda não configurado'
          }
          completed={!!project.start_date}
        >
          <p className="text-sm text-white/50">
            Defina quando acontecerá a campanha.
          </p>
        </ProjectSetupSection>
      </section>
    </main>
  )
}