import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Singing Coach",
  description: "Record, score, and improve your singing with AI feedback."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}
