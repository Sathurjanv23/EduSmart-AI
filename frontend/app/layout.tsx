import "./globals.css";
import type { Metadata } from "next";
import I18nProvider from "@/components/I18nProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";


export const metadata: Metadata = {
  title: "CampusCore School Management",
  description: "Secure school administration and academic portal",
  referrer: "no-referrer",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <I18nProvider>{children}</I18nProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
