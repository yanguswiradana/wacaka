import { Camera, Upload, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-6 py-10">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI & Web AR Aksara Bali</span>
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
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">AR Live Scanner</h2>
              <p className="text-xs text-zinc-400">
                Pindai plang jalan &amp; pura secara real-time (Issue #6 &amp; #7)
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-200">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Static Image Upload</h2>
              <p className="text-xs text-zinc-400">
                Unggah foto naskah/dokumen resolusi penuh (Issue #9)
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800 pt-4 text-center text-xs text-zinc-500">
        Monorepo starter siap — lanjutkan implementasi komponen AR &amp; AI.
      </footer>
    </main>
  );
}
