import type { Metadata, Viewport } from "next";

import { BottomNav } from "@/components/bottom-nav";

import "./globals.css";

export const metadata: Metadata = {
  title: "TOPIK 真题背诵库",
  description: "按题整理 TOPIK 真题词汇、语法和惯用表达的背诵工具",
  applicationName: "TOPIK 真题背诵库",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "TOPIK背诵",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full bg-[radial-gradient(circle_at_top,#f8fbff_0%,#f6f8fc_42%,#eef4f1_100%)] text-slate-900">
        <div className="mx-auto min-h-full w-full max-w-md">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
