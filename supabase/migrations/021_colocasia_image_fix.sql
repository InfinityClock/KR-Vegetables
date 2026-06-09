-- Migration 021 — Colocasia image direct fix
-- The smart resolver returns FALLBACK for Colocasia (Arbi) due to a known
-- URL resolution issue in the dev environment. Setting a direct verified URL.
-- photo-1598515214211 is a well-known taro/colocasia root image on Unsplash.
UPDATE products
  SET image_url = 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&q=80&auto=format&fit=crop'
  WHERE name = 'Colocasia (Arbi)';
