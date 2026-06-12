import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function Shimmer({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      style={style}
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r",
        "before:from-transparent before:via-white/60 before:to-transparent",
        className,
      )}
    />
  );
}

export function CardSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("rounded-2xl border bg-card p-5", className)}>
      <Shimmer className="h-4 w-1/3" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Shimmer key={i} className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 160, className }: { height?: number; className?: string }) {
  return (
    <div className={cn("rounded-2xl border bg-card p-5", className)}>
      <Shimmer className="h-4 w-1/3" />
      <div className="mt-4 flex items-end gap-2" style={{ height }}>
        {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
          <Shimmer key={i} className="flex-1" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

export function GaugeSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Shimmer className="size-24 rounded-full" />
      <div className="space-y-2">
        <Shimmer className="h-6 w-16" />
        <Shimmer className="h-3 w-32" />
      </div>
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3">
      <Shimmer className="size-8 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2 rounded-2xl border bg-white p-4">
        <Shimmer className="h-3 w-3/4" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function OcrSkeleton() {
  return (
    <div className="flex gap-3">
      <Shimmer className="size-8 shrink-0 rounded-full" />
      <div className="flex-1 rounded-2xl border bg-white p-4">
        <div className="text-xs font-medium text-muted-foreground">
          Reading the image and extracting the question text
        </div>
        <div className="mt-3 grid grid-cols-12 gap-2">
          <Shimmer className="col-span-2 h-16 rounded-lg" />
          <div className="col-span-10 space-y-2">
            <Shimmer className="h-3 w-5/6" />
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-3/4" />
            <Shimmer className="h-3 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
