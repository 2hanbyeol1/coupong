import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import QueryProvider from "@/shared/lib/provider/QueryProvider";
import { ModalProvider } from "@/shared/ui/Modal/Modal";
import ToastProvider from "@/shared/ui/Toast/Toast";

import "./globals.css";

export const metadata: Metadata = {
  title: "쿠퐁",
  description: "쿠폰 모으기",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  userScalable: false,
};

const pretendard = localFont({
  src: "../../public/font/PretendardVariable.woff2",
  display: "swap",
  variable: "--font-pretendard",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable}`}>
      <body className="font-pretendard">
        <QueryProvider>
          <ToastProvider>
            <ModalProvider>{children}</ModalProvider>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
