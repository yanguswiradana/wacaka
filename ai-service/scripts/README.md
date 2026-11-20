# Synthetic Dataset Generator (Wacaka AI)

Script ini menghasilkan ribuan gambar sintetis Aksara Bali beserta label **YOLOv8** (`labels/*.txt`) dan **OCR** (`ocr_labels.csv`) untuk melatih model lokal agar tidak bergantung penuh pada token Vision LLM.

## Langkah Penggunaan

1. **Siapkan Font Aksara Bali:**
   * Unduh `NotoSansBalinese-Regular.ttf` dari [Google Fonts (Noto Sans Balinese)](https://fonts.google.com/noto/specimen/Noto+Sans+Balinese) atau letakkan font `.ttf`/`.otf` Aksara Bali lainnya ke dalam folder `ai-service/scripts/fonts/`.
2. **Generate Dataset:**
   ```powershell
   cd ai-service
   .\.venv\Scripts\python.exe scripts\generate_dataset.py --samples-per-phrase 50
   ```
   Dengan 20 frasa di `corpus.json` × 50 sampel = **1.000 gambar** siap latih di `ai-service/scripts/dataset/`.
3. **Training di Google Colab (GPU Gratis):**
   * **YOLOv8n (Deteksi Blok Aksara Bali):** Zip folder `images/` + `labels/`, latih 1 kelas (`aksara_bali`), lalu export `best.onnx`.
   * **TrOCR / CRNN (Pembacaan Teks):** Gunakan `images/` + `ocr_labels.csv` untuk *fine-tuning* pembacaan Aksara Bali (termasuk variasi plang emas-di-atas-hitam).
