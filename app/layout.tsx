import type React from "react"
import type { Metadata } from "next"
import { Inter, Orbitron } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ZION - AI Voice Agent",
  description: "Experience the future of AI conversation with Zion, the most advanced voice agent",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.className} ${orbitron.variable}`}>
      <body className="bg-[#0a0a0a] text-white">
        <main>{children}</main>
      </body>
    </html>
  )
}
