# Wacaka

**Membaca Warisan, Menjembatani Generasi — Penerjemah Aksara Bali Berbasis AI & Web AR**

Lihat spesifikasi lengkap di [PRD.md](./PRD.md).

## Struktur Monorepo

```text
wacaka/
├── frontend/          # Next.js (App Router, TypeScript, Tailwind, Supabase) -> Vercel
├── ai-service/        # Python FastAPI + OpenCV + YOLOv8 ONNX -> HF Spaces / Railway / Docker
├── .github/           # Issue templates
├── docker-compose.yml
└── PRD.md
```

## Menjalankan Secara Lokal

### 1. AI Service (`ai-service/`)
Gunakan **Python 3.11 atau 3.12** (OpenCV belum mendukung Python 3.15 secara penuh):
```bash
cd ai-service
python -m venv .venv
# Windows: .venv\Scripts\activate | Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Atau menggunakan Docker:
```bash
docker compose up --build
```

### 2. Frontend (`frontend/`)
```bash
cd frontend
npm install
npm run dev
```
Buka `http://localhost:3000`. Untuk menguji kamera HP (`getUserMedia`), gunakan Cloudflare Tunnel:
```bash
cloudflared tunnel --url http://localhost:3000
```

## Alur Kerja Tim (GitHub)
1. Ambil 1 Issue dari tab **Issues** / **Projects**.
2. Buat branch baru dari `main`: `git checkout -b feat/nama-fitur`.
3. Kerjakan hanya di area folder masing-masing (`frontend/` atau `ai-service/`).
4. Buat Pull Request ke `main` dan sertakan `Closes #<nomor-issue>`.
