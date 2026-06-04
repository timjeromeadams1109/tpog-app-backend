import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TPOG App Backend",
  description: "Admin backend for TPOG Flutter app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
