/**
 * Customer profile persistence helpers.
 *
 * Stores name, phone, and up to 5 saved addresses in localStorage.
 * No backend required — same-device persistence only.
 *
 * Schema:
 * localStorage('kr-customer-profile') = {
 *   name:      string,
 *   phone:     string,
 *   addresses: [
 *     { id, label, line1, line2, city, pincode, lat, lng, isDefault }
 *   ]
 * }
 */

const KEY       = 'kr-customer-profile'
const MAX_SAVED = 5

export function getProfile() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveProfile(name, phone, addr, coords) {
  try {
    const existing = getProfile() || { name: '', phone: '', addresses: [] }
    const label    = addr.label || 'Home'

    // Build the new address record
    const newAddr = {
      id:        addr.id || crypto.randomUUID(),
      label,
      line1:     addr.line1  || '',
      line2:     addr.line2  || '',
      city:      addr.city   || '',
      pincode:   addr.pincode || '',
      lat:       coords?.lat  ?? null,
      lng:       coords?.lng  ?? null,
      isDefault: true,
    }

    // Upsert: match by label (Home / Office / Other) or by id
    const addresses = existing.addresses || []
    const idx = addresses.findIndex(a => a.label === label || a.id === newAddr.id)

    let updated
    if (idx >= 0) {
      // Update existing label slot — preserve its id
      updated = addresses.map((a, i) =>
        i === idx ? { ...newAddr, id: a.id, isDefault: true } : { ...a, isDefault: false }
      )
    } else {
      // New address — add at front, keep at most MAX_SAVED
      updated = [newAddr, ...addresses.map(a => ({ ...a, isDefault: false }))].slice(0, MAX_SAVED)
    }

    localStorage.setItem(KEY, JSON.stringify({
      name:      name      || existing.name  || '',
      phone:     phone     || existing.phone || '',
      addresses: updated,
    }))
  } catch { /* localStorage unavailable */ }
}

/** Returns the default (most recently used) address, or null. */
export function getDefaultAddress() {
  const profile = getProfile()
  if (!profile?.addresses?.length) return null
  return profile.addresses.find(a => a.isDefault) || profile.addresses[0]
}

export function clearProfile() {
  try { localStorage.removeItem(KEY) } catch {}
}
