import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { SelectedOrganizationSync } from "@/features/select-organization/ui/SelectedOrganizationSync";
import AuthStateProvider from "@/shared/lib/provider/AuthStateProvider";
import NotificationProvider from "@/shared/lib/provider/NotificationProvider";
import QueryProvider from "@/shared/lib/provider/QueryProvider";
import ThemeSync from "@/shared/lib/provider/ThemeSync";
import { THEME_COLOR, THEME_INIT_SCRIPT } from "@/shared/lib/theme/theme";
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
  // 고른 테마가 기기 설정과 다르면 applyTheme이 content를 바꿈
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR.dark },
  ],
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
    // 첫 화면 전에 스크립트가 dark 클래스를 붙이므로 서버 HTML과 달라도 경고하지 않음
    <html
      lang="ko"
      className={`${pretendard.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-pretendard">
        <QueryProvider>
          <AuthStateProvider>
            <NotificationProvider>
              <ToastProvider>
                <ModalProvider>
                  {children}
                  <SelectedOrganizationSync />
                  <ThemeSync />
                </ModalProvider>
              </ToastProvider>
            </NotificationProvider>
          </AuthStateProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
