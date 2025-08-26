import { Skeleton } from '@/components/ui/skeleton';

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-[2/3] w-full rounded-lg bg-muted/50 animate-pulse" />
          <div className="space-y-2 px-2">
            <Skeleton className="h-4 w-4/5 bg-muted/50" />
            <Skeleton className="h-3 w-3/5 bg-muted/30" />
          </div>
        </div>
      ))}
    </div>
  );
}