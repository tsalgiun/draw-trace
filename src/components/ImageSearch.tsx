"use client";

import { useState, useCallback } from "react";

const UNSPLASH_ACCESS_KEY = "YOUR_UNSPLASH_ACCESS_KEY";

interface UnsplashImage {
  id: string;
  urls: { small: string; regular: string };
  alt_description: string;
  user: { name: string };
}

interface ImageSearchProps {
  onImage: (url: string) => void;
  onClose: () => void;
}

export default function ImageSearch({ onImage, onClose }: ImageSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("unsplash_key") || "";
    return "";
  });
  const [showKeyInput, setShowKeyInput] = useState(!apiKey);

  const search = useCallback(async () => {
    if (!query.trim() || !apiKey) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20`,
        { headers: { Authorization: `Client-ID ${apiKey}` } }
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [query, apiKey]);

  const saveKey = () => {
    localStorage.setItem("unsplash_key", apiKey);
    setShowKeyInput(false);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/95 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <h2 className="text-white font-medium text-sm">Search Reference Image</h2>
        <button onClick={onClose} className="text-white/70 text-xl leading-none">&times;</button>
      </div>

      {showKeyInput ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <p className="text-white/60 text-sm text-center">
            Enter your free Unsplash API key to search images.
          </p>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Unsplash API Key"
            className="w-full max-w-sm px-4 py-2 rounded-lg bg-white/10 text-white text-sm border border-white/20 outline-none focus:border-white/50"
          />
          <button
            onClick={saveKey}
            className="px-6 py-2 rounded-lg bg-white text-black text-sm font-medium"
          >
            Save Key
          </button>
          <a
            href="https://unsplash.com/developers"
            target="_blank"
            rel="noreferrer"
            className="text-white/40 text-xs underline"
          >
            Get a free Unsplash API key
          </a>
        </div>
      ) : (
        <>
          <div className="p-3 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Search images..."
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white text-sm border border-white/20 outline-none focus:border-white/50"
            />
            <button
              onClick={search}
              className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium"
            >
              Search
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {results.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => { onImage(img.urls.regular); onClose(); }}
                    className="relative aspect-[3/2] rounded-lg overflow-hidden bg-white/5"
                  >
                    <img
                      src={img.urls.small}
                      alt={img.alt_description || ""}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-white/30 text-sm">
                {query ? "No results found" : "Type a search term to find images"}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
