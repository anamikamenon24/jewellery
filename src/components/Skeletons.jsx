import { CloudOff, RotateCw } from 'lucide-react'

export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-2xl ${className}`} aria-hidden="true" />
}

export function ProductCardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-3xl" aria-hidden="true">
      <div className="skeleton aspect-square" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-2.5 w-1/2" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-9 w-9 !rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8, className = 'grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4' }) {
  return (
    <div className={className} role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function PanelSkeleton({ className = 'h-64' }) {
  return <div className={`glass skeleton rounded-[2rem] ${className}`} role="status" aria-label="Loading" />
}

export function ErrorState({ error, onRetry, title }) {
  const offline = error?.code === 'DB_UNAVAILABLE' || error?.code === 'NETWORK' || error?.status >= 500
  return (
    <div className="glass mx-auto flex max-w-md flex-col items-center rounded-[2rem] px-8 py-12 text-center" role="alert">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-blush-400/15">
        <CloudOff className="h-7 w-7 text-blush-300" />
      </div>
      <h3 className="text-3xl font-semibold">{title || (offline ? 'Our vault is taking a nap' : 'Something went wrong')}</h3>
      <p className="mt-2 text-sm text-muted">{error?.message || 'Please try again in a moment.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary mt-6">
          <RotateCw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  )
}
