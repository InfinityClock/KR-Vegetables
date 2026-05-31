/**
 * Zoho OAuth token manager.
 * Caches the access token in module scope so Node.js warm invocations
 * don't hit the token endpoint on every request.
 *
 * Required Vercel env vars:
 *   ZOHO_CLIENT_ID      — from Zoho Developer Console (ORG type client)
 *   ZOHO_CLIENT_SECRET  — from Zoho Developer Console
 *   ZOHO_REFRESH_TOKEN  — long-lived refresh token (one-time manual setup)
 *
 * Token refresh endpoint: POST https://accounts.zoho.in/oauth/v2/token
 */

let _accessToken  = null
let _tokenExpiry  = 0   // Date.now() ms

/**
 * Returns a valid Zoho OAuth access token, refreshing if expired or absent.
 * @returns {Promise<string>}
 */
export async function getZohoToken() {
  // Return cached token if still valid (with 90-second safety margin)
  if (_accessToken && Date.now() < _tokenExpiry - 90_000) {
    return _accessToken
  }

  const clientId     = process.env.ZOHO_CLIENT_ID
  const clientSecret = process.env.ZOHO_CLIENT_SECRET
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET and ZOHO_REFRESH_TOKEN must be set in Vercel env vars')
  }

  // Send credentials in the POST body (application/x-www-form-urlencoded) rather
  // than the URL query string — keeps secrets out of server access logs.
  const body = new URLSearchParams({
    grant_type:    'refresh_token',
    client_id:     clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  })

  const res  = await fetch('https://accounts.zoho.in/oauth/v2/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  })
  const data = await res.json()

  if (!data.access_token) {
    throw new Error(`Zoho token refresh failed: ${data.error || data.message || JSON.stringify(data)}`)
  }

  _accessToken = data.access_token
  _tokenExpiry = Date.now() + (data.expires_in ?? 3600) * 1_000

  return _accessToken
}
