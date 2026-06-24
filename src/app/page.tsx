"use client";

import { useState } from "react";
import CameraFeed from "@/components/CameraFeed";
import ImageOverlay from "@/components/ImageOverlay";
import ImageUpload from "@/components/ImageUpload";
import ImageSearch from "@/components/ImageSearch";

export default function Home() {
  const [overlayUrl, setOverlayUrl] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <main className="relative w-full h-dvh bg-black overflow-hidden">
      <CameraFeed />

      <ImageOverlay imageUrl={overlayUrl} />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6 px-4 py-2 rounded-2xl bg-black/50 backdrop-blur-md">
        <ImageUpload onImage={setOverlayUrl} />
        <button
          onClick={() => setSearchOpen(true)}
          className="flex flex-col items-center gap-1"
          aria-label="Search image"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
              <circle cx="11" cy="11" r="7" />
              <path d="M16.5 16.5L21 21" />
            </svg>
          </div>
          <span className="text-white text-[10px]">Search</span>
        </button>
        {overlayUrl && (
          <button
            onClick={() => setOverlayUrl(null)}
            className="flex flex-col items-center gap-1"
            aria-label="Remove overlay"
          >
            <div className="w-10 h-10 rounded-full bg-red-500/30 flex items-center justify-center backdrop-blur-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
            <span className="text-white text-[10px]">Remove</span>
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
