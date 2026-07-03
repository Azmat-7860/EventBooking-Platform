import type { Metadata } from "next"
import { ItemDetailClient } from "./ItemDetailClient"

interface Props {
  params: Promise<{ slug: string }>
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"

async function getItem(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/items/${slug}`, { cache: "no-store" })
    const json = await res.json()
    return json.success ? json.data : null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await getItem(slug)
  if (!item) {
    return { title: "Item not found" }
  }
  return {
    title: item.metaTitle || item.title,
    description: item.metaDesc || item.description?.slice(0, 160),
    openGraph: {
      title: item.metaTitle || item.title,
      description: item.metaDesc || item.description?.slice(0, 160),
      type: "website",
    },
  }
}

export default async function ItemDetailPage({ params }: Props) {
  const { slug } = await params
  const item = await getItem(slug)

  if (!item) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-textPrimary">Item not found</h1>
          <p className="mt-2 text-textMuted">The service you are looking for does not exist.</p>
        </div>
      </div>
    )
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: item.title,
    description: item.description,
    provider: { "@type": "LocalBusiness", name: item.bundleName || "Event Vendor" },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ItemDetailClient item={item} />
    </>
  )
}
