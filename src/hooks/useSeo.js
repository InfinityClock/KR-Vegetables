import { useEffect } from 'react'

const SITE_NAME  = 'KR Vegetables & Fruits'
const DEFAULT_DESC = 'Fresh vegetables and fruits delivered daily from local farms in Chennai. Order online for same-day delivery.'
const DEFAULT_IMG  = 'https://krvegetables.in/favicon.jpg'

/**
 * Sets the document <title>, meta description, and Open Graph tags
 * for the current page. Resets to defaults on unmount.
 *
 * @param {object} opts
 * @param {string}  opts.title       — Page-specific title (appended with " — KR Vegetables & Fruits")
 * @param {string}  [opts.description]
 * @param {string}  [opts.image]     — OG image URL
 * @param {boolean} [opts.noSuffix]  — Set true to use title as-is (home page)
 */
export function useSeo({ title, description, image, noSuffix = false } = {}) {
  useEffect(() => {
    const fullTitle = noSuffix ? title : title ? `${title} — ${SITE_NAME}` : SITE_NAME
    const desc  = description || DEFAULT_DESC
    const img   = image || DEFAULT_IMG

    // <title>
    const prev = document.title
    document.title = fullTitle

    // Helper to set or create a meta tag
    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        const [attrName, attrVal] = attr.split('=')
        el.setAttribute(attrName.trim(), attrVal.trim().replace(/"/g, ''))
        document.head.appendChild(el)
      }
      el.setAttribute('content', value)
      return el
    }

    const metas = [
      setMeta('meta[name="description"]',         'name=description',       desc),
      setMeta('meta[property="og:title"]',         'property=og:title',      fullTitle),
      setMeta('meta[property="og:description"]',   'property=og:description', desc),
      setMeta('meta[property="og:image"]',         'property=og:image',      img),
      setMeta('meta[property="og:type"]',          'property=og:type',       'website'),
      setMeta('meta[property="og:site_name"]',     'property=og:site_name',  SITE_NAME),
      setMeta('meta[name="twitter:card"]',         'name=twitter:card',      'summary_large_image'),
      setMeta('meta[name="twitter:title"]',        'name=twitter:title',     fullTitle),
      setMeta('meta[name="twitter:description"]',  'name=twitter:description', desc),
      setMeta('meta[name="twitter:image"]',        'name=twitter:image',     img),
    ]

    return () => {
      document.title = prev
      // Restore description to default on unmount
      const descEl = document.querySelector('meta[name="description"]')
      if (descEl) descEl.setAttribute('content', DEFAULT_DESC)
    }
  }, [title, description, image, noSuffix])
}
