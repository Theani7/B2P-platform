import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono, Space_Grotesk } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "B2P Connect — Creator & Brand Collaborations",
  description: "Connect brands with promoters. Manage campaigns, collaborations, and growth.",
  openGraph: {
    title: "B2P Connect — Creator & Brand Collaborations",
    description: "Connect brands with promoters. Manage campaigns, collaborations, and growth.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "B2P Connect — Creator & Brand Collaborations",
    description: "Connect brands with promoters. Manage campaigns, collaborations, and growth.",
  },
};

export const viewport: Viewport = {
  themeColor: "#145aff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} ${display.variable}`}>
      <body className="font-inter bg-linen-canvas text-midnight-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
