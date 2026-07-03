import Link from 'next/link'

export default function AutoresDestaque({ autores }: { autores: any[] }) {
  if (!autores.length) return null

  return (
    <section className="px-4 mt-6">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35">
          Autores em destaque
        </p>

        <Link href="/palavra/autores" className="text-[11px] font-black text-brand-300">
          Ver todos
        </Link>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 scrollbar-hide">
        <div className="flex gap-4 pb-1">
          {autores.map((autor: any) => (
            <Link
              key={autor.id}
              href={`/palavra/autor/${autor.id}`}
              className="w-[82px] shrink-0 text-center active:scale-95 transition"
            >
              <div className="mx-auto h-[66px] w-[66px] rounded-full border-2 border-brand-400/45 bg-white/[0.05] p-1 shadow-[0_0_24px_rgba(59,130,246,0.18)]">
                <div className="h-full w-full overflow-hidden rounded-full bg-white/[0.06]">
                  {autor.avatar_url ? (
                    <img src={autor.avatar_url} alt={autor.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-black text-white/45">
                      {(autor.name ?? 'A').slice(0, 1)}
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-2 truncate text-[12px] font-black text-white">
                {autor.name}
              </p>

              <p className="text-[11px] text-white/40">
                {autor.total} palavra{autor.total === 1 ? '' : 's'}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}