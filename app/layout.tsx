import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bike OK",
  description: "Smart bike diagnosis and service platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}