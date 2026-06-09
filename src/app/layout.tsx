import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoreSync | BF Industries",
  description: "Raw material and production output transfer monitoring system.",
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
