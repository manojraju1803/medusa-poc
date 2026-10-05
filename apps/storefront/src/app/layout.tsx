import { Plus_Jakarta_Sans } from "next/font/google"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    template: "%s | IngredientsBazar — Next Generation Multi-Brand Ingredients Platform",
    default: "IngredientsBazar — Next Generation Multi-Brand Ingredients Platform",
  },
  description:
    "India's next generation multi-brand ingredients platform. Direct B2B raw material procurement for food, beverage, dairy and nutraceutical manufacturers.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakartaSans.variable} data-mode="light" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}

