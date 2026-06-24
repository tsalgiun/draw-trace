"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface ImageOverlayProps {
  imageUrl: string | null;
}

export default function ImageOverlay({ imageUrl }: ImageOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [opacity, setOpacity] = useState(50);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const lastDist = useRef(0);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  const fitScale = useCallback((w: number, h: number) => {
    if (!containerRef.current) return 1;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const s = Math.min(cw / w, ch / h) * 0.85;
    return Math.max(s, 0.1);
  }, []);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new window.Image();
    img.onload = () => {
      const s = fitScale(img.naturalWidth, img.naturalHeight);
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setScale(s);
      setPosition({ x: 0, y: 0 });
    };
    img.src = imageUrl;
  }, [imageUrl, fitScale]);

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, px: position.x, py: position.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setPosition({
      x: dragStart.current.px + (e.clientX - dragStart.current.x),
      y: dragStart.current.py + (e.clientY - dragStart.current.y),
    });
  };

  const onPointerUp = () => setDragging(false);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.max(0.1, Math.min(10, s * delta)));
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lastDist.current > 0) {
        const delta = d / lastDist.current;
        setScale((s) => Math.max(0.1, Math.min(10, s * delta)));
      }
      lastDist.current = d;
    }
  };

  const onTouchEnd = () => { lastDist.current = 0; };

  if (!imageUrl) return null;

  const displayW = naturalSize.w * scale;
  const displayH = naturalSize.h * scale;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-10 touch-none overflow-hidden"
      onWheel={onWheel}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Reference"
          draggable={false}
          style={{
            opacity: opacity / 100,
            transform: `translate(${position.x}px, ${position.y}px)`,
            width: displayW,
            height: displayH,
            maxWidth: "none",
            maxHeight: "none",
            cursor: dragging ? "grabbing" : "grab",
            touchAction: "none",
            willChange: "transform, opacity",
          }}
          className="select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
      </div>
      <div className="absolute bottom-4 left-4 right-20 z-20 flex items-center gap-3 bg-black/50 rounded-full px-4 py-2">
        <span className="text-white text-xs font-medium w-6 text-right">{opacity}%</span>
        <input
          type="range"
          min={5}
          max={100}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          className="flex-1 h-1 accent-white cursor-pointer"
          aria-label="Opacity"
        />
      </div>
    </div>
  );
}
