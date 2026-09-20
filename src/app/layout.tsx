import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leila Hair & Beauty",
  description: "Frontend do Desafio Técnico Leila Hair & Beauty",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
