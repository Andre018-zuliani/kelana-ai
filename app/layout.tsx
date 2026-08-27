import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KelanaAI — Plan your next adventure",
  description:
    "AI-powered travel itinerary planner built with Next.js, FastAPI, and Amazon Bedrock.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
