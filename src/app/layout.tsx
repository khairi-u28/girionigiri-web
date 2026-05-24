import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="id" className="scroll-smooth">
      <body className="font-heading antialiased">{children}</body>
    </html>
  );
}
