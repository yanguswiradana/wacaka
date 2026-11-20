import base64
import json
import os
import time
import cv2
import httpx
import numpy as np

DEFAULT_GEMINI_MODEL = "gemini-3-flash-preview"
FALLBACK_GEMINI_MODELS = [
    "gemini-3-flash-preview",
    "gemini-3.1-flash-lite",
]

VISION_PROMPT = """Kamu adalah sistem OCR & ahli Aksara Bali.
Tugasmu pada gambar ini:
1. Deteksi HANYA blok/baris teks ber-Aksara Bali.
2. ABAIKAN teks huruf Latin yang berada di bawah atau di samping Aksara Bali (sesuai Pergub Bali No. 80/2018, plang sering memiliki Aksara Bali di atas dan Latin di bawah — jangan menyalin huruf Latinnya, bacalah murni dari bentuk Aksara Bali-nya).
3. Untuk setiap blok Aksara Bali yang ditemukan, kembalikan JSON array `detections` dengan format:
   - `box_2d`: [ymin, xmin, ymax, xmax] dalam skala 0-1000.
   - `aksara_bali`: Teks Aksara Bali dalam standar Unicode (U+1B00-U+1B7F).
   - `transliteration`: Hasil bacaan ke huruf Latin yang tepat.
   - `meaning`: Penjelasan singkat arti kata/nama tempat budaya tersebut dalam Bahasa Indonesia (1 kalimat).
   - `confidence`: Angka keyakinan 0.0 sampai 1.0.
Jika tidak ada Aksara Bali yang terlihat jelas, kembalikan `{"detections": []}`."""


def _stub_response(width: int, height: int, mode: str, elapsed_ms: int) -> dict:
    """Fallback stub response when GEMINI_API_KEY is not configured."""
    return {
        "status": "success",
        "processing_time_ms": elapsed_ms,
        "image_dimensions": {"width": width, "height": height},
        "mode": mode,
        "results": [
            {
                "id": "det_01",
                "bbox": [
                    int(width * 0.2),
                    int(height * 0.35),
                    int(width * 0.8),
                    int(height * 0.5),
                ],
                "aksara_bali": "ᬚᬮᬦ᭄ ᬕᬢᭀᬢ᭄ ᬲᬸᬩ᭄ᬭᭀᬢᭀ",
                "transliteration": "Jalan Gatot Subroto",
                "meaning": "Nama jalan utama di Kota Denpasar (mode stub — set GEMINI_API_KEY untuk OCR aktif).",
                "confidence": 0.94,
            }
        ],
    }


def _box2d_to_pixel_bbox(
    box_2d: list[float], width: int, height: int
) -> list[int]:
    """Convert Gemini [ymin, xmin, ymax, xmax] (0-1000) to pixel [x1, y1, x2, y2]."""
    if len(box_2d) != 4:
        return [0, 0, width, height]
    ymin, xmin, ymax, xmax = box_2d
    x1 = max(0, min(width, int((xmin / 1000.0) * width)))
    y1 = max(0, min(height, int((ymin / 1000.0) * height)))
    x2 = max(x1 + 1, min(width, int((xmax / 1000.0) * width)))
    y2 = max(y1 + 1, min(height, int((ymax / 1000.0) * height)))
    return [x1, y1, x2, y2]


def run_translation_pipeline(img: np.ndarray, width: int, height: int, mode: str) -> dict:
    """Run Balinese script detection + transliteration using Gemini Vision API (with stub fallback)."""
    start = time.perf_counter()
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if not api_key:
        elapsed_ms = max(1, int((time.perf_counter() - start) * 1000))
        return _stub_response(width, height, mode, elapsed_ms)

    ok, encoded = cv2.imencode(".jpg", img, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
    if not ok:
        raise ValueError("Failed to encode preprocessed image.")

    image_b64 = base64.b64encode(encoded.tobytes()).decode("ascii")
    configured = os.getenv("GEMINI_MODEL", DEFAULT_GEMINI_MODEL).strip() or DEFAULT_GEMINI_MODEL
    candidate_models = [configured] + [m for m in FALLBACK_GEMINI_MODELS if m != configured]

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": VISION_PROMPT},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": image_b64,
                        }
                    },
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "thinkingConfig": {"thinkingBudget": 0},
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "detections": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "box_2d": {
                                    "type": "ARRAY",
                                    "items": {"type": "NUMBER"},
                                },
                                "aksara_bali": {"type": "STRING"},
                                "transliteration": {"type": "STRING"},
                                "meaning": {"type": "STRING"},
                                "confidence": {"type": "NUMBER"},
                            },
                            "required": [
                                "box_2d",
                                "aksara_bali",
                                "transliteration",
                                "meaning",
                                "confidence",
                            ],
                        },
                    }
                },
                "required": ["detections"],
            },
        },
    }

    timeout_sec = 7.0 if mode == "ar_fast" else 15.0
    body = None
    last_error: Exception | None = None

    with httpx.Client(timeout=timeout_sec) as client:
        for model in candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
            try:
                resp = client.post(url, params={"key": api_key}, json=payload)
                if resp.status_code in (404, 429, 503):
                    last_error = httpx.HTTPStatusError(
                        f"Model {model} returned {resp.status_code}",
                        request=resp.request,
                        response=resp,
                    )
                    continue
                resp.raise_for_status()
                body = resp.json()
                break
            except (httpx.TimeoutException, httpx.HTTPStatusError) as exc:
                last_error = exc
                continue

    if body is None:
        raise RuntimeError(f"All Gemini models failed: {last_error}")

    raw_text = (
        body.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("text", '{"detections": []}')
    )

    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError:
        parsed = {"detections": []}

    results = []
    for idx, item in enumerate(parsed.get("detections", []), start=1):
        results.append(
            {
                "id": f"det_{idx:02d}",
                "bbox": _box2d_to_pixel_bbox(item.get("box_2d", []), width, height),
                "aksara_bali": str(item.get("aksara_bali", "")),
                "transliteration": str(item.get("transliteration", "")),
                "meaning": str(item.get("meaning", "")),
                "confidence": float(item.get("confidence", 0.0)),
            }
        )

    elapsed_ms = max(1, int((time.perf_counter() - start) * 1000))
    return {
        "status": "success",
        "processing_time_ms": elapsed_ms,
        "image_dimensions": {"width": width, "height": height},
        "mode": mode,
        "results": results,
    }
