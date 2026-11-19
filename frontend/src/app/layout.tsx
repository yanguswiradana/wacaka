import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wacaka — Penerjemah Aksara Bali AI & Web AR",
  description:
    "Arahkan kamera ke plang, buku, atau naskah beraksara Bali untuk menerjemahkan ke huruf Latin dan memahami maknanya secara real-time.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
