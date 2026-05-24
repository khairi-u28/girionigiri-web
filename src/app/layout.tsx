import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "PO Giri-giri Onigiri | Sarapan Sat-Set Rasa Lokal",
  description:
    "Pre-order onigiri fusion dengan isian kearifan lokal. Sarapan sat-set buat kamu yang sibuk ngejar deadline pagi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("scroll-smooth", "font-sans", inter.variable)}>
      <body className="font-heading antialiased">{children}</body>
    </html>
  );
}
