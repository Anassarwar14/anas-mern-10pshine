import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Macondo_Swash_Caps, Montserrat, Playfair_Display, Quicksand, Vibes } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
    subsets: ["latin"]
})


const vibes = Vibes({
  variable: "--font-vibes",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})


const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})


const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})


const macSC = Macondo_Swash_Caps({
  variable: "--font-mac",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})




export const metadata: Metadata = {
  title: "Orris",
  description: "A Premium Note Taking App with easy-to-use UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${quicksand.variable} ${playfair.variable} ${vibes.variable} ${macSC.variable} ${montserrat.variable} ${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
