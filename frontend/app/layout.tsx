import "./globals.css";
import type { Metadata } from "next";
import I18nProvider from "@/components/I18nProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RoleProvider } from "@/components/RoleProvider";


export const metadata: Metadata = {
  title: "EduSmart",
  description: "Modern School Management System",
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
          <RoleProvider>
            <I18nProvider>{children}</I18nProvider>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}