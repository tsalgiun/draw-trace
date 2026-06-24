"use client";

import { useState, useRef } from "react";
import CameraFeed, { type CameraFeedHandle } from "@/components/CameraFeed";
import ImageOverlay, { type ImageOverlayHandle } from "@/components/ImageOverlay";
import ImageUpload from "@/components/ImageUpload";
import ImageSearch from "@/components/ImageSearch";
import GridOverlay, { type GridMode } from "@/components/GridOverlay";

export default function Home() {
  const cameraRef = useRef<CameraFeedHandle>(null);
  const overlayRef = useRef<ImageOverlayHandle>(null);
  const [overlayUrl, setOverlayUrl] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [gridMode, setGridMode] = useState<GridMode>("off");

  const cycleGrid = () => {
    setGridMode((m) => (m === "off" ? "3x3" : m === "3x3" ? "isometric" : "off"));
  };

  const captureTrace = () => {
    const video = cameraRef.current?.getVideoElement();
    const snapshotCanvas = cameraRef.current?.getSnapshotCanvas();
    const state = overlayRef.current?.getImageState();
    if (!video && !snapshotCanvas) return;

    const w = video?.videoWidth || snapshotCanvas?.width || 390;
    const h = video?.videoHeight || snapshotCanvas?.height || 844;

    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;

    // Draw camera frame
    if (snapshotCanvas && !snapshotCanvas.hidden) {
      ctx.drawImage(snapshotCanvas, 0, 0, w, h);
    } else if (video) {
      ctx.drawImage(video, 0, 0, w, h);
    }

    // Draw overlay image on top
    if (state?.img && overlayUrl) {
      const { img, opacity, position, scale, naturalSize } = state;
      const dw = naturalSize.w * scale;
      const dh = naturalSize.h * scale;
      const cx = w / 2 + position.x;
      const cy = h / 2 + position.y;
      ctx.globalAlpha = opacity / 100;
      ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
      ctx.globalAlpha = 1;
    }

    // Download
    const link = document.createElement("a");
    link.download = `trace-${Date.now()}.png`;
    link.href = c.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="relative w-full h-dvh bg-black overflow-hidden">
      <CameraFeed ref={cameraRef} />

      <GridOverlay mode={gridMode} />

      <ImageOverlay ref={overlayRef} imageUrl={overlayUrl} />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 px-3 py-2 rounded-2xl bg-black/50 backdrop-blur-md">
        <ImageUpload onImage={setOverlayUrl} />
        <button
          onClick={() => setSearchOpen(true)}
          className="flex flex-col items-center gap-0.5"
          aria-label="Search image"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
              <circle cx="11" cy="11" r="7" />
              <path d="M16.5 16.5L21 21" />
            </svg>
          </div>
          <span className="text-white text-[9px]">Search</span>
        </button>
        <button
          onClick={cycleGrid}
          className="flex flex-col items-center gap-0.5"
          aria-label="Toggle grid"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm ${gridMode !== "off" ? "bg-white/30 ring-1 ring-white/50" : "bg-white/20"}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
              <path d="M3 3h18v18H3z" />
              <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
            </svg>
          </div>
          <span className="text-white text-[9px]">Grid</span>
        </button>
        <button
          onClick={captureTrace}
          className="flex flex-col items-center gap-0.5"
          aria-label="Capture trace"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center backdrop-blur-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <span className="text-white text-[9px]">Save</span>
        </button>
        {overlayUrl && (
          <button
            onClick={() => setOverlayUrl(null)}
            className="flex flex-col items-center gap-0.5"
            aria-label="Remove overlay"
          >
            <div className="w-10 h-10 rounded-full bg-red-500/30 flex items-center justify-center backdrop-blur-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
            <span className="text-white text-[9px]">Remove</span>
          </button>
        )}
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-black/40 backdrop-blur-md rounded-full px-4 py-1.5">
        <p className="text-white/70 text-xs">Place phone over paper & trace the outline</p>
      </div>

      {searchOpen && (
        <ImageSearch
          onImage={setOverlayUrl}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </main>
  );
}
