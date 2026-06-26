import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_URL = "https://www.northgtasteel.ca";
const DESCRIPTION =
  "Design your custom pre-engineered steel building in 3D. Configure dimensions, roof style, colors, doors, windows and add-ons, then request a quote from North GTA Steel — Ontario's steel building partner serving Toronto, Vaughan, Brampton, Richmond Hill and across Ontario.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "3D Steel Building Designer | North GTA Steel",
    template: "%s | North GTA Steel",
  },
  description: DESCRIPTION,
  applicationName: "North GTA Steel — 3D Building Designer",
  authors: [{ name: "North GTA Steel Building Inc.", url: SITE_URL }],
  creator: "North GTA Steel Building Inc.",
  publisher: "North GTA Steel Building Inc.",
  keywords: [
    "steel buildings Ontario",
    "pre-engineered steel buildings",
    "custom steel building designer",
    "3D steel building configurator",
    "commercial steel buildings",
    "industrial steel buildings",
    "agricultural steel buildings",
    "steel building quote",
    "North GTA Steel",
    "steel buildings Toronto",
    "steel buildings Vaughan",
    "steel buildings Brampton",
  ],
  category: "construction",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: SITE_URL,
    siteName: "North GTA Steel",
    title: "3D Steel Building Designer | North GTA Steel",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "3D Steel Building Designer | North GTA Steel",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-CA" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
