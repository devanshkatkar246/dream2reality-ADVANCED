import type { Metadata } from "next";
import { Inter, Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import UsageStats from "@/components/UsageStats";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });
const syne = Syne({ subsets: ["latin"], weight: ["400", "800"], variable: "--font-syne" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "Dream2Reality AI | Simulation & Roadmap",
  description: "Experience your future dreams and turn them into a real-world reality with AI simulation and planning.",
};

import { AuthProvider } from "@/hooks/useAuth";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${syne.variable} ${dmSans.variable} min-h-screen bg-black text-white`}>
        <AuthProvider>
          <div className="fixed inset-0 pointer-events-none bg-gradient-mesh opacity-40 z-[-1]" />
          <Navbar />
          {children}
          <UsageStats />
        </AuthProvider>
      </body>
    </html>
  );
}
