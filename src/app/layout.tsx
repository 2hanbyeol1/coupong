import type { Metadata } from "next";
import localFont from "next/font/local";

import QueryProvider from "@/shared/lib/query/QueryProvider";
import { ModalProvider } from "@/shared/ui/Modal/Modal";
import ToastProvider from "@/shared/ui/Toast/Toast";

import "./globals.css";

export const metadata: Metadata = {
  title: "쿠퐁",
  description: "한별 가족 쿠폰 모음",
  manifest: "/manifest.json",
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
