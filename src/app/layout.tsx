import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";

export const metadata = {
  title: "ドット学習マップ",
  description: "Firebase ベースの教育用 Web アプリ",
  manifest: "/manifest.webmanifest",
  themeColor: "#1d8b6f",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ドット学習マップ"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
