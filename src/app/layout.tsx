import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Odonto Enterprise",
  description: "SaaS Odontológico Enterprise — gestão de clínicas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
