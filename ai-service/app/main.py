import os
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.inference import run_translation_pipeline
from app.preprocess import decode_and_resize, enhance_contrast

load_dotenv()

app = FastAPI(title="Wacaka AI Service", version="0.1.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_IMAGE_BYTES = 2 * 1024 * 1024  # 2MB per PRD


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "wacaka-ai"}


@app.post("/api/v1/translate")
async def translate_image(
    image: UploadFile = File(...),
    mode: str = Form("ar_fast"),
):
    if mode not in ("ar_fast", "document_detail"):
        raise HTTPException(status_code=400, detail="Invalid mode. Use 'ar_fast' or 'document_detail'.")

    payload = await image.read()
    if not payload:
        raise HTTPException(status_code=400, detail="Empty image file.")
    if len(payload) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds 2MB limit.")

    try:
        img, width, height = decode_and_resize(payload)
        enhanced = enhance_contrast(img)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return run_translation_pipeline(enhanced, width, height, mode)
