export type ScanMode = "ar_fast" | "document_detail";

export interface TranslationDetection {
  id: string;
  /** [x1, y1, x2, y2] relative to image_dimensions */
  bbox: [number, number, number, number];
  aksara_bali: string;
  transliteration: string;
  meaning: string;
  confidence: number;
}

export interface TranslationResponse {
  status: "success" | "error";
  processing_time_ms: number;
  image_dimensions: {
    width: number;
    height: number;
  };
  mode?: ScanMode;
  results: TranslationDetection[];
}
