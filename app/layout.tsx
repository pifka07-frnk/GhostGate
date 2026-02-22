import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GhostGate – Sei überall, außer in ihrer Datenbank",
  description:
    "GhostGate verschleiert deine digitale Identität durch aktive Data Obfuscation. Local On-Device VPN – deine Daten verlassen nie dein Handy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body className="min-h-screen antialiased bg-ghost-black text-zinc-200">
        {children}
      </body>
    </html>
  );
}
