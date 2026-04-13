import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SMS System",
  description: "School Management System",
  icons: {
    icon: "/logo.png", // ✅ ADD THIS
  },
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