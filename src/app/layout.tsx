import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Navbar from "../components/Navbar"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dergi",
  description: "Dergi Web Sitesi",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Navbar />
        <div className="pt-16">{children}</div>
      </body>
    </html>
  )
}
