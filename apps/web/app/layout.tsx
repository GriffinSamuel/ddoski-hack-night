import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Face-Roast Editor",
  description:
    "A webcam reads your mood and a meme avatar punishes your code: sad gets roasted, too happy gets deleted.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
