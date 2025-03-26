import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./libs/providers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Flash Cards",
  description: "The best way to keep learning!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-foreground bg-background`}
      >
        <Providers>
          {children}
          <ReactQueryDevtools initialIsOpen={true} position="bottom" />
        </Providers>
      </body>
    </html>
  );
}
