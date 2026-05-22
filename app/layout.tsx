import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "BTL Viva Helper",
  description: "Learning OS for online-auction-system viva preparation",
  icons: {
    icon: "/ltnc-cat.png",
    apple: "/ltnc-cat.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
