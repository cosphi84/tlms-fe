import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import {ReactQueryProvider} from "@/provider/react-query-provider";
import {ThemeProvider} from "next-themes";

import {Suspense} from "react";
import ErrorBoundary from "@/provider/error-boundary";
import {LoadingFallback} from "@/components/organism/loading-fallback";
import { TooltipProvider } from "@/components/atoms/tooltip";
import { SiteMetadata } from "@/configs/metadata";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: SiteMetadata.title,
    template: `%s | ${SiteMetadata.title}`
  },
  description: SiteMetadata.description,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={SiteMetadata.language}
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-mono",
        jetbrainsMono.variable
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <TooltipProvider>{children}</TooltipProvider>
              </Suspense>
            </ErrorBoundary>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
