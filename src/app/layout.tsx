import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/hooks/useToast";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SapaIKMP Landing Page",
  description: "Wujudkan Lingkungan IKMP yang Nyaman & Aman",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${publicSans.variable} font-display antialiased`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
