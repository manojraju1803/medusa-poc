import { getBaseURL } from "@lib/util/env"
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@lib/util/seo"
import { Metadata, Viewport } from "next"
import NavigationProgress from "@modules/layout/components/navigation-progress"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: `${SITE_NAME} - ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
}

export const viewport: Viewport = {
  themeColor: "#0d3320",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" data-mode="light">
      <body>
        <NavigationProgress />
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
