import type { Metadata } from "next";
import "./globals.css";

// Starter layout. nextjs-developer replaces the font and metadata from docs/DESIGN.md and docs/SPEC.md.
export const metadata: Metadata = {
  title: "Hackathon Starter",
  description: "Next.js + FastAPI + Supabase starter",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
