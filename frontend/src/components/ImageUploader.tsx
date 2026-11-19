"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Loader2, Upload, Volume2, Copy, Check } from "lucide-react";
import type { TranslationDetection, TranslationResponse } from "@/lib/types";
import ResultSheet from "./ResultSheet";

interface ImageUploaderProps {
  onBack: () => void;
}

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB per PRD

/** Static image upload view for high-detail Balinese script transcription and copyable results. */
export default function ImageUploader({ onBack }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<TranslationResponse | null>(null);
  const [selectedDetection, setSelectedDetection] =
    useState<TranslationDetection | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResponse(null);

    if (file.size > MAX_FILE_BYTES) {
      setError("Ukuran gambar melebihi batas 2MB. Pilih foto yang lebih kecil.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("mode", "document_detail");

      const res = await fetch("/api/translate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(`Gagal memproses gambar (${res.status}): ${msg}`);
        return;
      }

      const data: TranslationResponse = await res.json();
      setResponse(data);
    } catch {
      setError("Gagal menghubungi server AI. Pastikan ai-service berjalan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAll = async () => {
    if (!response || response.results.length === 0) return;
    const text = response.results
      .map((r) => `${r.aksara_bali}\n${r.transliteration}\n${r.meaning}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1800);
    } catch {
      // Ignore clipboard errors in non-secure contexts
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-6">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>
        <span className="text-xs font-medium text-zinc-400">
          Static Image Upload
        </span>
      </header>

      <section className="mt-6 space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/60 p-8 text-center transition hover:border-amber-500/60 hover:bg-zinc-900 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
              <span className="text-sm font-medium text-zinc-200">
                Membaca Aksara Bali...
              </span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-amber-400" />
              <span className="text-sm font-semibold text-zinc-100">
                Pilih Foto Plang atau Naskah
              </span>
              <span className="text-xs text-zinc-400">
                Format JPEG/PNG, maksimal 2MB
              </span>
            </>
          )}
        </button>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {previewUrl && (
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Pratinjau gambar Aksara Bali"
              className="max-h-64 w-full object-contain"
            />
          </div>
        )}

        {response && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-200">
                Hasil Transkripsi ({response.results.length}) ·{" "}
                <span className="text-zinc-400">
                  {response.processing_time_ms} ms
                </span>
              </h2>
              {response.results.length > 0 && (
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                >
                  {copiedAll ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin Semua</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {response.results.length === 0 ? (
              <p className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs text-zinc-400">
                Tidak ada Aksara Bali yang terdeteksi pada gambar ini.
              </p>
            ) : (
              <div className="space-y-2.5">
                {response.results.map((det) => (
                  <button
                    key={det.id}
                    type="button"
                    onClick={() => setSelectedDetection(det)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-left transition hover:border-amber-500/40"
                  >
                    <p className="font-balinese text-lg text-amber-300">
                      {det.aksara_bali}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-100">
                      {det.transliteration}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">{det.meaning}</p>
                    <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-amber-400">
                      <Volume2 className="h-3 w-3" />
                      <span>Ketuk untuk audio &amp; salin</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <ResultSheet
        detection={selectedDetection}
        onClose={() => setSelectedDetection(null)}
      />
    </main>
  );
}
