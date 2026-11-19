import time
import numpy as np


def run_translation_pipeline(img: np.ndarray, width: int, height: int, mode: str) -> dict:
    """
    Placeholder inference pipeline matching the PRD API contract.
    Replace with YOLOv8n (ONNX) detection + Vision OCR / TrOCR in Day 2.
    """
    start = time.perf_counter()

    # Centered stub bounding box relative to image dimensions
    x1 = int(width * 0.2)
    y1 = int(height * 0.35)
    x2 = int(width * 0.8)
    y2 = int(height * 0.5)

    elapsed_ms = max(1, int((time.perf_counter() - start) * 1000))

    return {
        "status": "success",
        "processing_time_ms": elapsed_ms,
        "image_dimensions": {"width": width, "height": height},
        "mode": mode,
        "results": [
            {
                "id": "det_01",
                "bbox": [x1, y1, x2, y2],
                "aksara_bali": "ᬚᬮᬦ᭄ ᬕᬢᭀᬢ᭄ ᬲᬸᬩ᭄ᬭᭀᬢᭀ",
                "transliteration": "Jalan Gatot Subroto",
                "meaning": "Nama jalan utama di Kota Denpasar (stub respons awal).",
                "confidence": 0.94,
            }
        ],
    }
