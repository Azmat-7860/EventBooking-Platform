import type { Metadata } from "next"
import { LandingPage } from "@/components/landing/LandingPage"

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "EventPro"
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eventpro.com"

export const metadata: Metadata = {
  title: `Discover & Book Premium Event Services | ${brandName}`,
  description:
    "Find and book the best photographers, DJs, venues, caterers, and entertainers for your next event. Browse top-rated vendors, send inquiries, and confirm your booking — all in one place.",
  keywords: [
    "event booking",
    "event services",
    "photographer",
    "DJ",
    "catering",
    "venue",
    "wedding planner",
    "party vendor",
    "corporate event",
  ],
  openGraph: {
    title: `${brandName} — Premium Event Services Booking`,
    description:
      "Find and book the best photographers, DJs, venues, caterers, and entertainers for your next event.",
    type: "website",
    siteName: brandName,
    url: siteUrl,
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: brandName,
  url: siteUrl,
  description:
    "Find and book the best photographers, DJs, venues, caterers, and entertainers for your next event.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  )
}
