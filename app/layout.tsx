import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DesignDock",
  description: "A personal AI design workbench for editable UI designs.",
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
