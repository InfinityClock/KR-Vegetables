/**
 * Stock-aware product sorting utilities.
 *
 * Priority: in_stock (0) → limited (1) → out_of_stock (2)
 * Products within the same availability group preserve their existing order.
 *
 * Used as a client-side safety net after database queries return results.
 * The primary sort happens server-side via ORDER BY stock_status ASC in
 * all Supabase queries (PostgreSQL enum ordering: in_stock < limited < out_of_stock).
 */

const STOCK_PRIORITY = { in_stock: 0, limited: 1, out_of_stock: 2 }

/**
 * Returns a new array sorted so in-stock products appear first,
 * then limited, then out-of-stock. Preserves relative order within
 * each group (stable sort).
 */
export function sortByStock(products) {
  if (!Array.isArray(products) || products.length === 0) return products
  return [...products].sort((a, b) => {
    const pa = STOCK_PRIORITY[a.stock_status] ?? 0
    const pb = STOCK_PRIORITY[b.stock_status] ?? 0
    return pa - pb
  })
}

/**
 * Comparator for use inside an existing .sort() call.
 * Returns negative when a should come before b.
 * Returns 0 when stock status is equal (caller handles tiebreaking).
 */
export function compareByStock(a, b) {
  const pa = STOCK_PRIORITY[a.stock_status] ?? 0
  const pb = STOCK_PRIORITY[b.stock_status] ?? 0
  return pa - pb
}
