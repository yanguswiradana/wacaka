"use client";

import { useState } from "react";
import { Camera, Upload, Sparkles } from "lucide-react";
import ArCamera from "@/components/ArCamera";

export default function HomePage() {
  const [showCamera, setShowCamera] = useState(false);

  if (showCamera) {
    return <ArCamera onBack={() => setShowCamera(false)} />;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-6 py-10">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI &amp; Web AR Aksara Bali</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Wacaka</h1>
        <p className="font-balinese text-xl text-amber-300">ᬯᬘᬓ</p>
        <p className="text-sm leading-relaxed text-zinc-400">
          Membaca Warisan, Menjembatani Generasi. Arahkan kamera ke plang,
          buku, atau naskah beraksara Bali untuk menerjemahkannya ke huruf
          Latin secara instan.
        </p>
      </header>

      <section className="my-8 space-y-3">
        <button
          type="button"
          onClick={() => setShowCamera(true)}
          className="w-full rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-left transition hover:bg-amber-500/20 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-zinc-950">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-50">
                Mulai Memindai (AR Live Scanner)
              </h2>
              <p className="text-xs text-zinc-400">
                Arahkan kamera ke plang jalan atau pura secara real-time
              </p>
            </div>
          </div>
        </button>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 opacity-70">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Static Image Upload</h2>
              <p className="text-xs text-zinc-400">
                Segera hadir (Issue #8) — unggah foto naskah dari galeri
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800 pt-4 text-center text-xs text-zinc-500">
        Wacaka MVP — Siap uji kamera AR via HTTPS / Cloudflare Tunnel.
      </footer>
    </main>
  );
}
