/**
 * KR Vegetables & Fruits — Bilingual i18n utilities
 *
 * Lightweight, zero-dependency localization. No external library needed.
 * English is the primary display language; Tamil is shown as secondary.
 *
 * Architecture:
 *   src/i18n/tamil.js        — Tamil strings (all translations in one place)
 *   src/i18n/index.js        — Export helpers (pure JS, no JSX)
 *   src/components/BilingualText.jsx — Reusable bilingual display component
 *
 * To add a new language (e.g. Kannada):
 *   1. Create src/i18n/kannada.js with the same key structure as tamil.js
 *   2. import { kn } from './kannada' here
 *   3. Add 'kn' to TRANSLATIONS
 */

import { ta } from './tamil'

export const TRANSLATIONS = { ta }

/**
 * Get a translated string by dot-path (e.g. 'category.vegetable').
 * Returns undefined when the path doesn't exist — callers should fall back
 * to the English string.
 *
 * @param {string} path  — dot-separated key path
 * @param {string} locale — language code (default: 'ta')
 */
export function t(path, locale = 'ta') {
  const lang = TRANSLATIONS[locale]
  if (!lang) return undefined
  return path.split('.').reduce((obj, key) => obj?.[key], lang)
}

/**
 * Resolve the Tamil name for a category.
 * Priority:
 *   1. DB tamil_name column (most up-to-date, admin-controlled)
 *   2. Static mapping in tamil.js (fallback for categories without DB entry)
 *   3. undefined (caller should omit the Tamil line)
 *
 * @param {string} englishName  — category.name from DB
 * @param {string} dbTamilName  — category.tamil_name from DB (may be null)
 */
export function getCategoryTamil(englishName, dbTamilName) {
  if (dbTamilName) return dbTamilName
  return ta.subcategory[englishName]
}
