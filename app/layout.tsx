import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth_context";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "KelanaAI — AI Travel Planner with Protected User Trips",
  description:
    "AI-powered personalized travel itinerary planner with secure user accounts and protected trips.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        <AuthProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
