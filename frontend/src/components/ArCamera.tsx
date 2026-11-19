"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { mapBboxToScreen, type ScreenBox } from "@/lib/bbox";
import type { TranslationDetection, TranslationResponse } from "@/lib/types";
import ResultSheet from "./ResultSheet";

interface ArCameraProps {
  onBack: () => void;
}

interface RenderedBox {
  detection: TranslationDetection;
  screen: ScreenBox;
}

/** Fullscreen WebRTC rear camera with AR bounding-box canvas overlay and in-flight auto-scan lock. */
export default function ArCamera({ onBack }: ArCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isScanningRef = useRef(false);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [statusNote, setStatusNote] = useState<string>("Arahkan kamera ke Aksara Bali");
  const [renderedBoxes, setRenderedBoxes] = useState<RenderedBox[]>([]);
  const [selectedDetection, setSelectedDetection] =
    useState<TranslationDetection | null>(null);
  const [lastResponse, setLastResponse] = useState<TranslationResponse | null>(null);

  // Start rear camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let cancelled = false;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Browser tidak mendukung akses kamera atau halaman tidak dibuka melalui HTTPS."
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setCameraError(
          "Izin kamera ditolak atau kamera tidak ditemukan. Pastikan akses kamera diizinkan."
        );
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      activeStream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Draw AR bounding boxes onto overlay canvas whenever response or viewport changes
  const drawOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.max(1, Math.round(rect.width * dpr));
    const targetH = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (!lastResponse || lastResponse.results.length === 0) {
      setRenderedBoxes([]);
      return;
    }

    const { width: frameW, height: frameH } = lastResponse.image_dimensions;
    const boxes: RenderedBox[] = [];

    for (const det of lastResponse.results) {
      const box = mapBboxToScreen(det.bbox, frameW, frameH, rect.width, rect.height);
      boxes.push({ detection: det, screen: box });

      // Semi-transparent AR highlight box
      ctx.fillStyle = "rgba(245, 158, 11, 0.18)";
      ctx.strokeStyle = "rgba(251, 191, 36, 0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(box.x, box.y, box.width, box.height, 10);
      ctx.fill();
      ctx.stroke();

      // Latin transliteration label pill above or inside box
      const label = det.transliteration;
      ctx.font = "600 14px 'Plus Jakarta Sans', system-ui, sans-serif";
      const textWidth = ctx.measureText(label).width;
      const pillW = Math.min(rect.width - 16, textWidth + 20);
      const pillH = 28;
      const pillX = Math.max(8, Math.min(box.x, rect.width - pillW - 8));
      const pillY = box.y > 36 ? box.y - pillH - 6 : box.y + 6;

      ctx.fillStyle = "rgba(9, 9, 11, 0.88)";
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 8);
      ctx.fill();

      ctx.fillStyle = "#fde68a";
      ctx.fillText(label, pillX + 10, pillY + 19, pillW - 20);
    }

    setRenderedBoxes(boxes);
  }, [lastResponse]);

  useEffect(() => {
    drawOverlay();
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => drawOverlay());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [drawOverlay]);

  const captureAndScan = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || isScanningRef.current) return;

    isScanningRef.current = true;
    setIsScanning(true);

    try {
      const srcW = video.videoWidth || 1280;
      const srcH = video.videoHeight || 720;
      const maxWidth = 1280;
      const scale = srcW > maxWidth ? maxWidth / srcW : 1;
      const targetW = Math.round(srcW * scale);
      const targetH = Math.round(srcH * scale);

      if (!captureCanvasRef.current) {
        captureCanvasRef.current = document.createElement("canvas");
      }
      const capCanvas = captureCanvasRef.current;
      capCanvas.width = targetW;
      capCanvas.height = targetH;

      const capCtx = capCanvas.getContext("2d");
      if (!capCtx) return;
      capCtx.drawImage(video, 0, 0, targetW, targetH);

      const blob = await new Promise<Blob | null>((resolve) =>
        capCanvas.toBlob(resolve, "image/jpeg", 0.82)
      );
      if (!blob) return;

      const formData = new FormData();
      formData.append("image", blob, "frame.jpg");
      formData.append("mode", "ar_fast");

      const t0 = performance.now();
      const res = await fetch("/api/translate", {
        method: "POST",
        body: formData,
      });
      const elapsed = Math.round(performance.now() - t0);

      if (!res.ok) {
        setStatusNote("Gagal memproses gambar dari server AI.");
        return;
      }

      const data: TranslationResponse = await res.json();
      setLastResponse(data);
      setLatencyMs(elapsed);
      setStatusNote(
        data.results.length > 0
          ? "Ketuk kotak teks untuk melihat makna & audio"
          : "Tidak ada Aksara Bali terdeteksi"
      );
    } catch {
      setStatusNote("Koneksi ke server AI terputus.");
    } finally {
      isScanningRef.current = false;
      setIsScanning(false);
    }
  }, []);

  // Auto-scan loop with in-flight lock + 700ms cooldown after each completed request
  useEffect(() => {
    if (!autoScan || cameraError) return;
    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const loop = async () => {
      if (cancelled) return;
      await captureAndScan();
      if (!cancelled) {
        timerId = setTimeout(loop, 700);
      }
    };

    loop();

    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [autoScan, cameraError, captureAndScan]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || renderedBoxes.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const hit = renderedBoxes.find(
      ({ screen }) =>
        clickX >= screen.x - 8 &&
        clickX <= screen.x + screen.width + 8 &&
        clickY >= screen.y - 36 &&
        clickY <= screen.y + screen.height + 8
    );

    if (hit) {
      setAutoScan(false);
      setSelectedDetection(hit.detection);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Live Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
      />

      {/* AR Canvas Overlay */}
      <canvas
        ref={overlayCanvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 h-full w-full cursor-pointer"
      />

      {/* Center Reticle Guide */}
      {!cameraError && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-44 w-72 rounded-2xl border border-white/30 shadow-[0_0_0_9999px_rgba(0,0,0,0.18)]" />
        </div>
      )}

      {/* Top Bar */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-4 pt-4 pb-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/80 px-3 py-2 text-xs font-medium text-zinc-100 backdrop-blur"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2 rounded-full bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-200 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>{latencyMs !== null ? `${latencyMs} ms` : "AR Scanner"}</span>
        </div>
      </header>

      {/* Camera Error State */}
      {cameraError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-zinc-950/95 p-6 text-center">
          <div className="max-w-xs space-y-4">
            <p className="text-sm text-zinc-300">{cameraError}</p>
            <button
              type="button"
              onClick={onBack}
              className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-zinc-950"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      {!cameraError && (
        <footer className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-6 pt-10 pb-8">
          <p className="rounded-full bg-zinc-900/85 px-3.5 py-1 text-xs text-zinc-200 backdrop-blur">
            {statusNote}
          </p>

          <div className="flex w-full max-w-sm items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setAutoScan((prev) => !prev)}
              className={`flex items-center gap-2 rounded-full px-4 py-3 text-xs font-semibold transition ${
                autoScan
                  ? "bg-amber-500 text-zinc-950"
                  : "border border-zinc-700 bg-zinc-900/90 text-zinc-200"
              }`}
            >
              <RefreshCw
                className={`h-4 w-4 ${autoScan ? "animate-spin" : ""}`}
              />
              <span>{autoScan ? "Auto: ON" : "Auto: OFF"}</span>
            </button>

            <button
              type="button"
              onClick={captureAndScan}
              disabled={isScanning}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-sm font-bold text-zinc-950 shadow-lg transition hover:bg-amber-400 active:scale-[0.98] disabled:opacity-60"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memindai...</span>
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  <span>Pindai Sekarang</span>
                </>
              )}
            </button>
          </div>
        </footer>
      )}

      {/* Bottom Sheet Detail */}
      <ResultSheet
        detection={selectedDetection}
        onClose={() => setSelectedDetection(null)}
      />
    </div>
  );
}
