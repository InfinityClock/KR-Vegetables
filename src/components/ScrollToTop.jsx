/**
 * ScrollToTop — resets the viewport to the top on every route change.
 *
 * React Router's pushState navigation does not scroll to top by default —
 * the browser preserves scroll position because it treats SPA navigation
 * the same as history pushes. This component overrides that for forward
 * navigation while respecting the user's Back/Forward button expectations.
 *
 * How it works:
 *   - Mounted once inside <BrowserRouter> so it always has access to location
 *   - Listens to pathname changes via useLocation()
 *   - Calls window.scrollTo with behavior:'instant' (no scroll animation)
 *   - 'instant' is intentional — users expect to land at the top immediately,
 *     not watch the page scroll up after clicking a link
 *
 * Does NOT affect:
 *   - In-page anchor navigation (#section)
 *   - Programmatic scrolling inside pages
 *   - Modal open/close (no route change)
 */
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // 'instant' avoids the jarring "scroll to top" animation on every navigation.
    // Both desktop and mobile benefit from landing at the top with no animation.
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    } catch {
      // Fallback for very old browsers that don't support ScrollToOptions
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return null  // renders nothing — purely behavioural
}
