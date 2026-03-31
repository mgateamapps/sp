import { LoadingProvider } from "@/contexts/LoadingContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ScorePrompt - AI Literacy Assessment Platform",
  description: "Measure and improve your team's AI literacy with ScorePrompt assessments.",
  openGraph: {
    title: "ScorePrompt - AI Literacy Assessment Platform",
    description: "Measure and improve your team's AI literacy with ScorePrompt assessments.",
    siteName: "ScorePrompt",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScorePrompt - AI Literacy Assessment Platform",
    description: "Measure and improve your team's AI literacy with ScorePrompt assessments.",
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}
