export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(80,120,255,0.18),_transparent_35%)]" />

      <div className="relative flex flex-col items-center gap-5">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-brand-400/10 blur-xl animate-pulse" />

          <div className="absolute h-20 w-20 rounded-full border border-brand-400/20" />
          <div className="absolute h-16 w-16 rounded-full border border-brand-300/20" />

          <div className="h-14 w-14 rounded-full border-2 border-transparent border-t-brand-300 border-r-brand-300 animate-spin" />

          <div className="absolute h-7 w-7 rounded-full bg-brand-400/20 flex items-center justify-center">
            <div className="h-2.5 w-2.5 rounded-full bg-brand-300 shadow-[0_0_20px_rgba(96,165,250,0.9)]" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-[11px] font-black tracking-[0.28em] uppercase text-brand-200">
            Carregando
          </p>
          <p className="mt-2 text-xs text-white/45">
            Preparando sua experiência
          </p>
        </div>
      </div>
    </div>
  )
}