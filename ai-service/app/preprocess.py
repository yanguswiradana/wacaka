import cv2
import numpy as np


def decode_and_resize(image_bytes: bytes, max_width: int = 1280) -> tuple[np.ndarray, int, int]:
    """Decode raw image bytes into BGR ndarray and downscale if wider than max_width."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Invalid image payload: unable to decode.")

    height, width = img.shape[:2]
    if width > max_width:
        scale = max_width / width
        new_height = int(height * scale)
        img = cv2.resize(img, (max_width, new_height), interpolation=cv2.INTER_AREA)
        height, width = img.shape[:2]

    return img, width, height


def enhance_contrast(img: np.ndarray) -> np.ndarray:
    """Apply CLAHE on the luminance channel to improve readability on outdoor signs."""
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l_chan, a_chan, b_chan = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l_chan)
    merged = cv2.merge((cl, a_chan, b_chan))
    return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)
