import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Noto_Serif_TC } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ApiKeySettings from "@/components/ApiKeySettings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 標題用的襯線字：英文 Instrument Serif，中文 Noto Serif TC
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const notoSerifTC = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  weight: ["600", "700"],
  preload: false, // 中文字型很大，依需要分段載入
});

export const metadata: Metadata = {
  title: {
    default: "Rehearse — AI 面試模擬器",
    template: "%s | Rehearse",
  },
  description: "貼上職缺描述，AI 面試官為你量身出題、即時追問，最後給出評分與每題的示範回答。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${notoSerifTC.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
        <ApiKeySettings />
      </body>
    </html>
  );
}
