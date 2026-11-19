import { NextRequest, NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const mode = formData.get("mode") || "ar_fast";

    if (!image || !(image instanceof Blob)) {
      return NextResponse.json(
        { status: "error", message: "Field 'image' wajib berupa file gambar." },
        { status: 400 }
      );
    }

    const upstreamForm = new FormData();
    upstreamForm.append("image", image);
    upstreamForm.append("mode", String(mode));

    const upstreamRes = await fetch(`${AI_SERVICE_URL}/api/v1/translate`, {
      method: "POST",
      body: upstreamForm,
    });

    if (!upstreamRes.ok) {
      const errorText = await upstreamRes.text();
      return NextResponse.json(
        { status: "error", message: `AI service error: ${errorText}` },
        { status: upstreamRes.status }
      );
    }

    const data = await upstreamRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy /api/translate error:", error);
    return NextResponse.json(
      {
        status: "error",
        message:
          "Gagal menghubungi AI service. Pastikan ai-service berjalan atau AI_SERVICE_URL sudah benar.",
      },
      { status: 502 }
    );
  }
}
