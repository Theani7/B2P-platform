import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Byparsathy — Creator & Brand Collaborations",
  description: "Connect brands with promoters. Manage campaigns, collaborations, and growth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="font-inter bg-linen-canvas text-midnight-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
