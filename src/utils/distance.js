/**
 * Haversine distance formula.
 * Returns the straight-line distance in kilometres between two lat/lng points.
 * Accurate to within ~0.5% for distances up to ~100 km.
 */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const R   = 6371          // Earth's mean radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a   =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg) { return (deg * Math.PI) / 180 }

/**
 * Returns true if the given coordinates are within `radiusKm` of the store.
 */
export function isWithinDeliveryRadius(lat, lng, storeLat, storeLng, radiusKm) {
  if (!lat || !lng) return null   // unknown — don't block
  return haversineKm(lat, lng, storeLat, storeLng) <= radiusKm
}

/**
 * Returns the distance in km formatted as a readable string, e.g. "3.2 km"
 */
export function formatDistance(lat, lng, storeLat, storeLng) {
  const d = haversineKm(lat, lng, storeLat, storeLng)
  return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`
}
