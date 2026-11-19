# Product Requirement Document (PRD) & Spesifikasi Teknis: Wacaka

**Membaca Warisan, Menjembatani Generasi — Penerjemah Aksara Bali Berbasis AI & Web AR**

* **Tema:** Pelestarian Budaya
* **Kategori:** AI & Augmented Reality (Edutech / Tourism Tech)
* **Status:** Siap Pengembangan (MVP)

> **Ringkasan Konsep (Pitch & Registrasi — 273 Karakter):**
> Wacaka: Penerjemah Aksara Bali berbasis AI (OCR) dan Web AR. Pengguna cukup mengarahkan kamera ke plang, buku, atau naskah beraksara Bali untuk menerjemahkannya ke huruf Latin secara real-time. Solusi praktis untuk menjembatani literasi budaya bagi generasi muda dan wisatawan.

---

## 1. Ringkasan Eksekutif & Latar Belakang

**Wacaka** (diambil dari istilah Kawi/Sanskerta yang berarti *pembaca naskah*) adalah aplikasi web progresif (PWA) berbasis kecerdasan buatan (*Computer Vision* dan OCR) serta *Markerless Web Augmented Reality* (AR) yang memindai teks beraksara Bali melalui kamera perangkat secara langsung maupun unggahan gambar, lalu menimpanya (*overlay*) dengan teks Latin beserta konteks maknanya secara instan di browser tanpa instalasi aplikasi.

### Latar Belakang Berbasis Data
1. **Kehadiran Masif di Ruang Publik (Pergub Bali No. 80 Tahun 2018):**
   Berdasarkan Pasal 6 Peraturan Gubernur Bali Nomor 80 Tahun 2018 tentang Pelindungan dan Penggunaan Bahasa, Aksara, dan Sastra Bali, **Aksara Bali wajib ditempatkan di atas huruf Latin** pada papan nama ruang publik (pura, bale banjar, kantor pemerintahan/swasta, nama jalan, sarana pariwisata, dan fasilitas umum).
2. **Kesenjangan Literasi Generasi Muda:**
   Berbagai studi kasus pendidikan bahasa Bali di lapangan menunjukkan tingkat literasi fungsional yang masih rendah—sejumlah observasi mencatat hanya sekitar **~20% siswa/remaja** yang fasih membaca dan menulis Aksara Bali murni tanpa panduan, terutama terkendala pada rangkaian *gantungan*, *gempelan*, dan *pangangge* sesuai aturan *pasang aksara*.
3. **Keterbatasan Layanan Umum:**
   Aplikasi penerjemah kamera massal seperti Google Translate/Lens belum mendukung pembacaan Aksara Bali secara langsung, sementara wisatawan dan generasi muda membutuhkan akses cepat tanpa harus mengunduh aplikasi tambahan.

---

## 2. Analisis Kompetitor & Posisi Unik (Differentiator)

| Produk / Riset Eksisting | Platform & Cara Kerja | Keterbatasan Utama | Posisi Unik Wacaka |
| :--- | :--- | :--- | :--- |
| **Readbali** (`readbali.com`) | Web OCR berbasis unggah foto untuk naskah lontar & papan jalan. | Berbasis unggah gambar statis (*upload/drag-and-drop*), bukan *live AR camera overlay*. | **Markerless Live AR Overlay** langsung di *viewfinder* kamera web (ala Google Lens). |
| **Saraswati / ToLatin / Nulis Aksara Bali** | Aplikasi Android (*Play Store*) untuk OCR naskah, kamus, dan konversi teks. | Wajib instalasi APK/aplikasi di Android; kurang praktis bagi wisatawan lintas OS (iOS/Android). | **Web PWA lintas platform** — cukup buka tautan, tanpa instalasi. |
| **Nyastra** (`nyastra.co.id`) | Web transliterasi teks berbasis *rule*. | Input manual (mengetik), tidak mendukung pemindaian kamera. | Pemindaian visual instan dari kamera maupun galeri. |
| **Riset AR Akademik (Unity + Vuforia)** | Aplikasi Android AR berbasis *marker* tertentu. | Bergantung pada *marker* terdaftar dan ukuran APK besar. | **Markerless** — bekerja pada plang jalan dan cetakan umum tanpa *marker* khusus. |

**Positioning Statement Wacaka:**
*Web AR (markerless) instan tanpa instalasi untuk menerjemahkan plang ruang publik Aksara Bali sekaligus menjelaskan konteks budayanya dalam Bahasa Indonesia/Inggris secara real-time.*

---

## 3. Target Pengguna (User Personas)

| Segmen Pengguna | Kebutuhan Utama | Skenario Penggunaan Wacaka |
| :--- | :--- | :--- |
| **Pelajar & Mahasiswa** | Alat bantu cepat untuk memverifikasi pelafalan dan penulisan Aksara Bali pada tugas sekolah. | Memindai buku pelajaran muatan lokal atau lembar kerja untuk mencocokkan hasil bacaan Latin. |
| **Wisatawan (Domestik & Asing)** | Memahami nama jalan, tempat suci, atau informasi budaya yang tertulis di ruang publik. | Mengarahkan kamera HP ke plang jalan atau gapura pura untuk melihat terjemahan instan beserta arti tempatnya. |
| **Masyarakat Umum & Peneliti** | Membaca tipografi aksara pada karya seni, produk UMKM, atau potongan arsip naskah. | Mengunggah foto dokumen/prasasti melalui mode pemindai statis untuk menyalin transkripsi teksnya. |

---

## 4. Lingkup Fitur (Scope of Work — MVP)

| ID | Nama Fitur | Deskripsi Fungsional | Prioritas |
| :--- | :--- | :--- | :--- |
| **F-01** | **AR Live Scanner** | Mengakses kamera belakang via WebRTC, menangkap *frame* secara berkala (dengan *in-flight lock* agar request tidak menumpuk) atau via tombol *Scan*, dan merender kotak teks Latin tepat di atas posisi aksara asli menggunakan HTML5 `<canvas>` dengan kompensasi skala & *offset* `object-cover`. | **P0 (Wajib)** |
| **F-02** | **Static Image Upload** | Memungkinkan pengguna mengunggah foto dari galeri (plang, halaman buku, lontar) untuk diproses pada resolusi penuh dengan hasil transkripsi Unicode yang dapat disalin (*copy*). | **P0 (Wajib)** |
| **F-03** | **Contextual Meaning** | Selain transliterasi huruf (Aksara $\rightarrow$ Latin), sistem menampilkan penjelasan ringkas arti budaya/lokasi (Bahasa Indonesia / Inggris) pada *bottom sheet*. | **P1 (Nilai Tambah)** |
| **F-04** | **Text-to-Speech (TTS)** | Tombol audio menggunakan Web Speech API (`id-ID`) bawaan peramban untuk melafalkan hasil bacaan Latin. | **P2 (Opsional)** |

---

## 5. Alur Pengguna (User Flow)

1. **Akses Aplikasi:** Pengguna membuka tautan web Wacaka $\rightarrow$ tampil layar penyambut singkat dan tombol *"Mulai Memindai"*.
2. **Izin Perangkat:** Pengguna menyetujui izin akses kamera $\rightarrow$ *viewfinder* layar penuh terbuka dengan bingkai fokus (*reticle*) di area tengah.
3. **Pemindaian:** Pengguna mengarahkan kamera ke teks Aksara Bali dan menekan tombol **Pindai** (atau mengaktifkan mode *auto-scan* dengan mekanisme *in-flight lock* + jeda 500ms setelah respons diterima).
4. **Inferensi AI:** *Frame* gambar dikirim ke API *backend* $\rightarrow$ sistem hanya menargetkan **baris Aksara Bali** (mengabaikan teks Latin di baris bawah plang sesuai Pergub 80/2018).
5. **Visualisasi AR:** Kotak semi-transparan berisi teks Latin muncul menimpa aksara asli di layar. Mengetuk kotak tersebut akan membuka *bottom sheet* berisi teks Aksara Bali (Unicode), bacaan Latin, arti kontekstual, dan tombol audio pelafalan.

---

## 6. Pre-Development Checklist (Prasyarat Sebelum Coding)

* [x] **Kunci Keputusan Jalur AI & Arsitektur Stack:** Disepakati **Hybrid Web Architecture** — **Next.js (Vercel + Supabase)** untuk aplikasi web/AR & penyimpanan data, serta **Python AI Service (FastAPI + OpenCV + YOLOv8 ONNX + Vision OCR)** untuk deteksi & pembacaan Aksara Bali.
* [ ] **Aset Data & Materi Uji:**
  * Gunakan font **Bali Simbar** (representasi plang/cetak *legacy*) **dan** **Noto Sans Balinese** (standar Unicode `U+1B00–U+1B7F`) untuk membuat **3–5 lembar cetakan A4** sebagai skenario demo *live*.
  * Siapkan **10–15 foto uji** plang asli ruang publik Bali.
  * *(Opsional untuk fase lanjutan/fine-tuning)*: Referensi dataset publik **NusaAksara** (Hugging Face / Mendeley Data) dan **DeepLontar**.
* [ ] **Standar Rendering Web:** Wajib menyertakan font **Noto Sans Balinese** pada *frontend* dan memastikan field `aksara_bali` pada respons API berformat **Unicode (`U+1B00–U+1B7F`)**, bukan *ASCII hack* Bali Simbar, agar tidak tampil sebagai kotak kosong di perangkat mobile.
* [ ] **Konfigurasi HTTPS Lokal:** Siapkan **Cloudflare Tunnel (`cloudflared`)** atau **ngrok** untuk pengujian kamera `getUserMedia` di HP saat pengembangan lokal.
* [ ] **Kunci Kontrak API & GitHub Workflow:** Sepakati skema JSON di bawah ini serta pembagian *GitHub Issues* & *Feature Branch* untuk kerja paralel tim.

---

## 7. Kontrak API Utama: `POST /api/v1/translate`

* **Request:** `multipart/form-data`
  * `image`: File JPEG/PNG (maks. 2MB)
  * `mode`: `"ar_fast"` | `"document_detail"`
* **Response (`200 OK`):**

```json
{
  "status": "success",
  "processing_time_ms": 420,
  "image_dimensions": { "width": 1280, "height": 720 },
  "results": [
    {
      "id": "det_01",
      "bbox": [310, 240, 890, 320],
      "aksara_bali": "ᬚᬮᬦ᭄ ᬕᬢᭀᬢ᭄ ᬲᬸᬩ᭄ᬭᭀᬢᭀ",
      "transliteration": "Jalan Gatot Subroto",
      "meaning": "Nama jalan utama di Kota Denpasar.",
      "confidence": 0.94
    }
  ]
}
```

> **Catatan Teknis `bbox`:** Format koordinat adalah `[x1, y1, x2, y2]` relatif terhadap `image_dimensions`. *Frontend* wajib menghitung rasio *scale* & *crop offset* dari CSS `object-cover` agar kotak AR tepat menempel di atas teks pada layar HP.

### Arsitektur Teknis & Struktur Monorepo

| Lapisan | Tech Stack | Hosting & Tanggung Jawab |
| :--- | :--- | :--- |
| **Web PWA & AR** | Next.js (App Router), TypeScript, Tailwind CSS, `pnpm` | **Vercel** — Antarmuka *mobile-first*, WebRTC kamera, *overlay* HTML5 `<canvas>`, *bottom sheet* makna + TTS, serta API proxy ke `ai-service`. |
| **Database & Feedback** | Supabase (PostgreSQL) | **Supabase** — Menyimpan riwayat scan, kamus/konteks budaya, dan *feedback* koreksi pengguna sebagai dataset lanjutan. |
| **AI Service (CV & OCR)** | Python 3.11, FastAPI, OpenCV (`cv2`), YOLOv8n (`onnxruntime`), Vision OCR SDK | **Hugging Face Spaces / Railway / Cloud Run** (backup lokal via Docker + Cloudflare Tunnel) — Pre-processing CLAHE, deteksi blok Aksara Bali (`bbox`), dan transliterasi Unicode + Latin. |

```text
wacaka/
├── .github/
│   └── ISSUE_TEMPLATE/
├── frontend/                  # Next.js (App Router + Tailwind + Supabase) -> Vercel
│   ├── package.json
│   └── src/
│       ├── app/
│       │   └── api/translate/route.ts
│       ├── components/
│       │   ├── ArCamera.tsx
│       │   ├── ResultSheet.tsx
│       │   └── ImageUploader.tsx
│       └── lib/
│           ├── bbox.ts
│           └── supabase.ts
├── ai-service/                # Python FastAPI + OpenCV + YOLOv8 ONNX -> HF Spaces
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── preprocess.py
│       └── inference.py
├── docker-compose.yml
├── .env.example
└── PRD.md
```

---

## 8. Rencana Eksekusi 3 Hari & Kriteria Keberhasilan

| Fase Waktu | Aktivitas Utama | Target Luaran |
| :--- | :--- | :--- |
| **Hari 1: Fondasi** | Setup monorepo GitHub, pembagian *Issues*, kerangka API stub `/api/v1/translate`, dan halaman kamera *frontend*. Menyiapkan aset uji cetak (Bali Simbar & Noto Sans Balinese). | Koneksi *frontend–backend* aktif; *feed* kamera tampil di peramban HP via HTTPS. |
| **Hari 2: Pipeline AI** | Implementasi *pre-processing* dan integrasi deteksi area Aksara Bali + transliterasi & makna kontekstual. | API mengembalikan JSON koordinat `bbox` & bacaan Latin yang akurat (mengabaikan baris Latin pada plang). |
| **Hari 3: AR & Demo** | Rendering *overlay* HTML5 `<canvas>` (dengan kompensasi `object-cover`), *bottom sheet* makna + TTS, mode *Static Image Upload*, dan deployment. | Demo pemindaian langsung berjalan stabil dan mulus di perangkat HP. |

### Kriteria Keberhasilan Demo (Acceptance Criteria)
1. Total latensi dari pengiriman gambar hingga munculnya *overlay* AR tidak melebihi **1,5 detik** pada skenario demo normal.
2. Akurasi pembacaan mencapai minimal **85%** pada 3 skenario cetak uji (nama jalan, nama tempat suci/pura, dan kalimat pendek) di bawah pencahayaan ruangan standar.
3. Aplikasi berjalan stabil tanpa *crash* selama sesi demonstrasi berlangsung.

---

## 9. Roadmap Pasca-MVP (Ekspansi ke Mobile App)

Setelah fase MVP Web PWA berjalan stabil, arsitektur *API-first* (`ai-service` + **Supabase**) memungkinkan ekspansi langsung ke **Aplikasi Mobile (React Native / Flutter)** tanpa membangun ulang sistem AI maupun basis data:
* **Platform Belajar Bahasa Daerah Interaktif:** Modul belajar bertahap (Aksara Wianjana, *gantungan/gempelan*, *pasang aksara*), kuis, dan pelacakan progres pengguna di Supabase.
* **Native AR & Offline Pack:** Peningkatan kamera *native* serta pengunduhan kamus/model ringan untuk penggunaan di area wisata dengan sinyal terbatas.
