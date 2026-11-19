"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Volume2, X } from "lucide-react";
import type { TranslationDetection } from "@/lib/types";

interface ResultSheetProps {
  detection: TranslationDetection | null;
  onClose: () => void;
}

/** Bottom sheet displaying Balinese script, Latin transliteration, cultural meaning, and TTS audio. */
export default function ResultSheet({ detection, onClose }: ResultSheetProps) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setCopied(false);
    setIsSpeaking(false);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [detection?.id]);

  if (!detection) return null;

  const handleCopy = async () => {
    const text = `${detection.aksara_bali}\n${detection.transliteration}\n${detection.meaning}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API may be blocked in non-secure contexts
    }
  };

  const handleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(detection.transliteration);
    utterance.lang = "id-ID";
    utterance.rate = 0.92;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const confidencePct = Math.round(detection.confidence * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl border-t border-zinc-800 bg-zinc-950 p-6 pb-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-700" />

        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
            Akurasi {confidencePct}%
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail"
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="font-balinese text-2xl leading-relaxed text-amber-300">
            {detection.aksara_bali}
          </p>
          <h3 className="text-xl font-bold text-zinc-50">
            {detection.transliteration}
          </h3>
          <p className="text-sm leading-relaxed text-zinc-300">
            {detection.meaning}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleSpeak}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 active:scale-[0.99]"
          >
            <Volume2 className="h-4 w-4" />
            <span>{isSpeaking ? "Melafalkan..." : "Dengarkan"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800 active:scale-[0.99]"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Salin Teks</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
