import { useState } from 'react'
import JewelArt from './JewelArt'

// Renders a product image URL from the database.
//  - "art:Earrings/Kundan/0?gem=C0392B" -> Glimmora's SVG jewellery art (placeholder images)
//  - anything else                       -> a normal <img>, falling back to art if it fails to load
export function parseArtUrl(url) {
  const m = /^art:([^/]+)\/([^/]+)\/(\d+)(?:\?gem=([0-9A-Fa-f]{6}))?$/.exec(url || '')
  if (!m) return null
  return { category: decodeURIComponent(m[1]), finish: decodeURIComponent(m[2]), view: Number(m[3]), gem: m[4] ? `#${m[4]}` : undefined }
}

export default function ProductImage({ url, product, view, className = '', sparkle = true, alt }) {
  const [failed, setFailed] = useState(false)
  const art = parseArtUrl(url)
  if (art || failed || !url) {
    return (
      <JewelArt
        category={art?.category || product?.category}
        finish={art?.finish || product?.finish}
        gem={art?.gem}
        view={view ?? art?.view ?? 0}
        sparkle={sparkle}
        className={className}
      />
    )
  }
  return <img src={url} alt={alt || product?.name || ''} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />
}
