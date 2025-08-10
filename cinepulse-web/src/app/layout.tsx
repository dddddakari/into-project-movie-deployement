import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movie Collection",
  description: "A groovy movie tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
