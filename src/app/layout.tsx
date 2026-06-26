import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/shared/Providers"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import { Sidebar } from "@/components/shared/Sidebar"
import { MobileNav } from "@/components/shared/MobileNav"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_BRAND_NAME || "EventPro",
    template: `%s | ${process.env.NEXT_PUBLIC_BRAND_NAME || "EventPro"}`,
  },
  description: "Book premium event services — photography, venues, catering, and more.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
          <Footer />
          <MobileNav />
        </Providers>
      </body>
    </html>
  )
}
