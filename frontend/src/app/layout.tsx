"use client";

import "./globals.css";
import { defaultTheme, ThemeProvider } from "@tritonse/tse-constellation";
import Head from "next/head";
import { usePathname } from "next/navigation";

import ProtectedRoute from "../components/ProtectedRoute";
import { AuthProvider } from "../context/AuthContext";

import { Navbar } from "@/src/components/Navbar/Navbar";

const metadata = {
  title: "Meemli",
  description: "A Next.js app with the new app router",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar =
    pathname === "/login/" || pathname === "/activate/" || pathname === "/forgot-password/";

  return (
    <html lang="en">
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body>
        <AuthProvider>
          <ThemeProvider
            colors={{
              ...defaultTheme.colors,

              /** Primary colors */
              primary_light: "#FFFFFF",
              primary_dark: "#102D5F", // Accent blue

              // /** Functional colors */
              background: "#ECEFF3",
              success: "#3BB966",
              error: "#BE2D46",
              disabled: "#818181",

              // /** Neutral colors */
              black: "#232220",
            }}
          >
            {!hideNavbar && (
              <header>
                <Navbar />
              </header>
            )}
            <ProtectedRoute>
              <main>{children}</main>
            </ProtectedRoute>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
