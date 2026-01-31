import { Navbar } from "./(ui)/_components/Navbar/Navbar";
import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meemli",
  description: "A Next.js app with the new app router",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <Navbar />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
