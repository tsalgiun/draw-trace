"use client";

import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";

export interface ImageOverlayHandle {
  getImageState: () => {
    img: HTMLImageElement | null;
    opacity: number;
    position: { x: number; y: number };
    scale: number;
    rotation: number;
    naturalSize: { w: number; h: number };
  };
  reset: () => void;
  rotate: () => void;
}

interface ImageOverlayProps {
  imageUrl: string | null;
}

const ImageOverlay = forwardRef<ImageOverlayHandle, ImageOverlayProps>(function ImageOverlay({ imageUrl }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [opacity, setOpacity] = useState(50);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const lastDist = useRef(0);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const fittedScale = useRef(1);

  useImperativeHandle(ref, () => ({
    getImageState: () => ({
      img: imgRef.current,
      opacity,
      position,
      scale,
      rotation,
      naturalSize,
    }),
    reset: () => {
      setPosition({ x: 0, y: 0 });
      setScale(fittedScale.current);
      setRotation(0);
    },
    rotate: () => {
      setRotation((r) => (r + 90) % 360);
    },
  }));

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
      fittedScale.current = s;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setScale(s);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
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

  const isRotated = rotation % 180 !== 0;
  const displayW = (isRotated ? naturalSize.h : naturalSize.w) * scale;
  const displayH = (isRotated ? naturalSize.w : naturalSize.h) * scale;

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
            transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
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
      <div className="absolute top-14 left-4 right-4 z-30 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2">
        <span className="text-white text-xs font-medium w-8 text-right shrink-0">{opacity}%</span>
        <input
          type="range"
          min={5}
          max={100}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          className="flex-1 h-1.5 accent-white cursor-pointer min-w-0"
          aria-label="Opacity"
        />
        <button
          onClick={() => setRotation((r) => (r + 90) % 360)}
          className="shrink-0 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center"
          aria-label="Rotate image"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
          </svg>
        </button>
        <button
          onClick={() => {
            setPosition({ x: 0, y: 0 });
            setScale(fittedScale.current);
            setRotation(0);
          }}
          className="shrink-0 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center"
          aria-label="Reset overlay"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
            <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
    </div>
  );
});

export default ImageOverlay;
