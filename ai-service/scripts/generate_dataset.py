"""
Synthetic Balinese Script Dataset Generator for YOLOv8 & TrOCR/CRNN training.

Generates realistic sign variations (gold-on-black acrylic, black-on-white print,
and red-white Pergub 80/2018 signboards) with augmentations and exports:
  - dataset/images/*.jpg
  - dataset/labels/*.txt         (YOLOv8 1-class: 0 cx cy w h)
  - dataset/ocr_labels.csv       (TrOCR/CRNN: file_name,aksara_bali,latin)
"""

from __future__ import annotations

import argparse
import csv
import json
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


STYLES = [
    {"name": "gold_on_black", "bg": (15, 15, 18), "fg": (218, 165, 32)},
    {"name": "black_on_white", "bg": (246, 244, 238), "fg": (24, 24, 27)},
    {"name": "black_on_cream", "bg": (235, 224, 198), "fg": (32, 26, 20)},
    {"name": "black_on_red_tint", "bg": (228, 175, 168), "fg": (20, 20, 20)},
]


def find_fonts(fonts_dir: Path) -> list[Path]:
    """Collect .ttf/.otf fonts from fonts_dir."""
    if not fonts_dir.exists():
        return []
    return sorted(
        p for p in fonts_dir.iterdir() if p.suffix.lower() in {".ttf", ".otf"}
    )


def render_sample(
    text: str,
    font_path: Path,
    style: dict,
    rng: random.Random,
) -> tuple[Image.Image, tuple[int, int, int, int]]:
    """Render a single Balinese script image and return (image, pixel_bbox)."""
    width, height = 640, 256
    font_size = rng.randint(44, 68)
    font = ImageFont.truetype(str(font_path), font_size)

    img = Image.new("RGB", (width, height), style["bg"])
    draw = ImageDraw.Draw(img)

    # Measure text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    # Center with slight random jitter
    max_jitter_x = max(4, (width - text_w) // 8)
    max_jitter_y = max(4, (height - text_h) // 8)
    x = max(16, (width - text_w) // 2 + rng.randint(-max_jitter_x, max_jitter_x))
    y = max(16, (height - text_h) // 2 + rng.randint(-max_jitter_y, max_jitter_y))

    draw.text((x - bbox[0], y - bbox[1]), text, font=font, fill=style["fg"])
    tight_box = (
        max(0, x - 8),
        max(0, y - 8),
        min(width, x + text_w + 8),
        min(height, y + text_h + 8),
    )

    # Light camera augmentations
    if rng.random() < 0.45:
        img = img.filter(ImageFilter.GaussianBlur(radius=rng.uniform(0.3, 1.0)))
    if rng.random() < 0.6:
        img = ImageEnhance.Brightness(img).enhance(rng.uniform(0.82, 1.18))
    if rng.random() < 0.5:
        img = ImageEnhance.Contrast(img).enhance(rng.uniform(0.85, 1.25))

    return img, tight_box


def to_yolo_line(box: tuple[int, int, int, int], img_w: int, img_h: int) -> str:
    """Convert pixel [x1, y1, x2, y2] to normalized YOLOv8 format."""
    x1, y1, x2, y2 = box
    cx = ((x1 + x2) / 2.0) / img_w
    cy = ((y1 + y2) / 2.0) / img_h
    bw = (x2 - x1) / img_w
    bh = (y2 - y1) / img_h
    return f"0 {cx:.6f} {cy:.6f} {bw:.6f} {bh:.6f}\n"


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate synthetic Balinese script dataset for YOLO & OCR."
    )
    parser.add_argument(
        "--samples-per-phrase",
        type=int,
        default=25,
        help="Number of augmented images per phrase (default: 25).",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path(__file__).resolve().parent / "dataset",
        help="Output dataset directory.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducibility.",
    )
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    corpus_path = script_dir / "corpus.json"
    fonts_dir = script_dir / "fonts"

    fonts = find_fonts(fonts_dir)
    if not fonts:
        raise SystemExit(
            f"Tidak ada font .ttf/.otf di '{fonts_dir}'.\n"
            "Unduh NotoSansBalinese-Regular.ttf (dari Google Fonts) atau taruh font Aksara Bali di folder tersebut."
        )

    corpus = json.loads(corpus_path.read_text(encoding="utf-8"))
    images_dir = args.output_dir / "images"
    labels_dir = args.output_dir / "labels"
    images_dir.mkdir(parents=True, exist_ok=True)
    labels_dir.mkdir(parents=True, exist_ok=True)

    rng = random.Random(args.seed)
    csv_path = args.output_dir / "ocr_labels.csv"
    total = 0

    with csv_path.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(["file_name", "aksara_bali", "latin", "style"])

        for idx, entry in enumerate(corpus):
            aksara = entry["aksara_bali"]
            latin = entry["latin"]

            for s_idx in range(args.samples_per_phrase):
                font_path = rng.choice(fonts)
                style = rng.choice(STYLES)
                img, box = render_sample(aksara, font_path, style, rng)

                stem = f"balinese_{idx:03d}_{s_idx:03d}"
                img_name = f"{stem}.jpg"
                img.save(images_dir / img_name, quality=90)

                (labels_dir / f"{stem}.txt").write_text(
                    to_yolo_line(box, img.width, img.height),
                    encoding="utf-8",
                )
                writer.writerow([img_name, aksara, latin, style["name"]])
                total += 1

    print(f"Selesai! {total} gambar sintetis dibuat di: {args.output_dir}")


if __name__ == "__main__":
    main()
