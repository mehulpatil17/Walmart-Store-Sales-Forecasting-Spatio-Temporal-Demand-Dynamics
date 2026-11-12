import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeContext";
import { SidebarProvider } from "@/components/SidebarContext";
import MainLayout from "@/components/MainLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Walmart Store Sales Forecasting | Academic Research Portal (ES 335)",
  description: "IIT Gandhinagar ES 335 ML Project: Hierarchical multi-series sales forecasting, leak-free chronological validation, and hyperparameter optimization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('portal-theme');
                if (saved === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-zinc-100/70 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans flex flex-col">
        <ThemeProvider>
          <SidebarProvider>
            <MainLayout>{children}</MainLayout>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
