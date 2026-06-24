"use client";

export type GridMode = "off" | "3x3" | "isometric";

interface GridOverlayProps {
  mode: GridMode;
}

export default function GridOverlay({ mode }: GridOverlayProps) {
  if (mode === "off") return null;

  if (mode === "3x3") {
    return (
      <div className="absolute inset-0 z-[5] pointer-events-none">
        <div className="absolute top-0 left-1/3 w-px h-full bg-white/15" />
        <div className="absolute top-0 left-2/3 w-px h-full bg-white/15" />
        <div className="absolute top-1/3 left-0 w-full h-px bg-white/15" />
        <div className="absolute top-2/3 left-0 w-full h-px bg-white/15" />
      </div>
    );
  }

  if (mode === "isometric") {
    return (
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <svg viewBox="0 0 390 844" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <g stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none">
            {Array.from({ length: 20 }).map((_, i) => {
              const y = i * 60;
              return (
                <line key={`r${i}`} x1={0} y1={y} x2={390} y2={y + 100} />
              );
            })}
            {Array.from({ length: 20 }).map((_, i) => {
              const y = i * 60 + 60;
              return (
                <line key={`l${i}`} x1={0} y1={y} x2={390} y2={y - 100} />
              );
            })}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 80} y1={0} x2={i * 80 + 400} y2={844} />
            ))}
          </g>
        </svg>
      </div>
    );
  }

  return null;
}
