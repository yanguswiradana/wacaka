export interface ScreenBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Map a backend bbox [x1, y1, x2, y2] (relative to captured frame dimensions)
 * onto a fullscreen <video>/<canvas> element styled with CSS `object-cover`.
 */
export function mapBboxToScreen(
  bbox: [number, number, number, number],
  frameWidth: number,
  frameHeight: number,
  canvasWidth: number,
  canvasHeight: number
): ScreenBox {
  const scale = Math.max(canvasWidth / frameWidth, canvasHeight / frameHeight);
  const offsetX = (canvasWidth - frameWidth * scale) / 2;
  const offsetY = (canvasHeight - frameHeight * scale) / 2;

  const [x1, y1, x2, y2] = bbox;
  return {
    x: x1 * scale + offsetX,
    y: y1 * scale + offsetY,
    width: (x2 - x1) * scale,
    height: (y2 - y1) * scale,
  };
}
