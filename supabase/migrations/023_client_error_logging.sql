-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 023 — Client-side error logging
--
-- Until now, render-time errors caught by ErrorBoundary only went to
-- console.error — visible only on the exact device where the crash
-- happened, in that device's own browser devtools. When a client reported
-- "Admin panel error" on their phone, there was no way to see what the
-- actual underlying error was without physical access to their device.
--
-- This table captures every ErrorBoundary catch with enough context to
-- diagnose remotely: the error message/stack, which boundary caught it
-- (admin vs customer), the URL, and the user agent (so device/browser
-- can be identified, e.g. distinguishing a normal browser from a
-- constrained in-app WebView).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS client_errors (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  message          TEXT,
  stack            TEXT,
  component_stack  TEXT,
  boundary         TEXT,        -- 'admin' | 'customer'
  url              TEXT,
  user_agent       TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE client_errors ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous customers and admins who just crashed before
-- auth context was even usable) can insert an error report — write-only,
-- no way to read back what others have submitted.
CREATE POLICY "client_errors_insert_anyone" ON client_errors
  FOR INSERT WITH CHECK (true);

-- Only admins can read the error log.
CREATE POLICY "client_errors_select_admin" ON client_errors
  FOR SELECT USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_client_errors_created_at ON client_errors(created_at DESC);
