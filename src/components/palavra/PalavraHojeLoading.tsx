export default function PalavraHojeLoading() {
  return (
    <div className="pb-24 px-4 pt-5 animate-pulse">
      {/* Responsável skeleton */}
      <div className="flex items-center gap-3 pb-4">
        <div className="w-9 h-9 rounded-full skeleton" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-28 skeleton rounded" />
          <div className="h-2.5 w-20 skeleton rounded" />
        </div>
      </div>

      {/* Versículo skeleton */}
      <div className="mb-3 px-4 py-4 border border-white/[0.05] rounded-r-xl space-y-2">
        <div className="h-3.5 w-full skeleton rounded" />
        <div className="h-3.5 w-4/5 skeleton rounded" />
        <div className="h-3.5 w-3/5 skeleton rounded" />
        <div className="h-3 w-20 skeleton rounded mt-2" />
      </div>

      {/* Reflexão skeleton */}
      <div className="mb-3 p-4 bg-white/[0.03] rounded-2xl space-y-2">
        <div className="h-2.5 w-16 skeleton rounded mb-2" />
        <div className="h-3 w-full skeleton rounded" />
        <div className="h-3 w-full skeleton rounded" />
        <div className="h-3 w-3/4 skeleton rounded" />
      </div>

      {/* Interações skeleton */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="h-20 skeleton rounded-2xl" />
        <div className="h-20 skeleton rounded-2xl" />
      </div>
      <div className="h-10 skeleton rounded-xl" />
    </div>
  )
}
