import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

// Explicitly list tamil_name so the smart bilingual search can score it.
// Using `*` would also work but being explicit makes the dependency clear.
const PRODUCT_SELECT = `*, tamil_name, categories(id, name, emoji)`;

export const useProducts = (filters = {}) => {
  const { category_id, search, is_featured, sort, limit } = filters;
  const [state, setState] = useState({ products: [], loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    (async () => {
      try {
        let q = supabase
          .from('products')
          .select(PRODUCT_SELECT)
          .eq('is_active', true);

        if (category_id)   q = q.eq('category_id', category_id);
        if (is_featured)   q = q.eq('is_featured', true);
        // Search across both the English name and the Tamil name columns.
        if (search)        q = q.or(`name.ilike.%${search}%,tamil_name.ilike.%${search}%`);
        if (sort === 'offers') q = q.not('offer_price', 'is', null);

        // sort_order ASC (admin-controlled position), then created_at DESC as tiebreaker
        q = q.order('sort_order', { ascending: true }).order('created_at', { ascending: false });
        if (limit) q = q.limit(limit);

        const { data, error: err } = await q;
        if (cancelled) return;
        if (err) throw err;
        if (!cancelled) setState({ products: data || [], loading: false, error: null });
      } catch (err) {
        if (!cancelled) setState({ products: [], loading: false, error: err });
      }
    })();

    return () => { cancelled = true; };
  }, [category_id, search, is_featured, sort, limit, tick]);

  return { ...state, refetch: () => setTick((t) => t + 1) };
};

/**
 * Fetches ALL active products once and caches them for the session.
 * Used by Shop for client-side smart search (tanglish + fuzzy).
 */
let _allProductsCache = null;
let _allProductsPromise = null;

/** Call after any admin product create / update / delete so the customer shop reflects changes immediately. */
export function bustProductCache() {
  _allProductsCache = null;
  _allProductsPromise = null;
}

export const useAllProducts = () => {
  const [products, setProducts] = useState(_allProductsCache || []);
  const [loading, setLoading] = useState(!_allProductsCache);

  useEffect(() => {
    if (_allProductsCache) { setProducts(_allProductsCache); setLoading(false); return; }

    if (!_allProductsPromise) {
      _allProductsPromise = supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .then(({ data }) => { _allProductsCache = data || []; return _allProductsCache; });
    }

    _allProductsPromise.then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  return { products, loading };
};

export const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const { data, error: err } = await supabase
          .from('products')
          .select(PRODUCT_SELECT)
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (err) throw err;
        if (cancelled) return;
        setProduct(data);

        if (data?.category_id) {
          const { data: rel } = await supabase
            .from('products')
            .select(PRODUCT_SELECT)
            .eq('category_id', data.category_id)
            .eq('is_active', true)
            .neq('id', id)
            .limit(12); // fetch more so we can prioritise in-stock
          if (!cancelled) {
            // Sort: in-stock first, limited next, out-of-stock last
            const order = { in_stock: 0, limited: 1, out_of_stock: 2 };
            const sorted = (rel || []).sort((a, b) =>
              (order[a.stock_status] ?? 1) - (order[b.stock_status] ?? 1)
            );
            // Only show section if at least one in-stock item exists in category
            const hasInStock = sorted.some(p => p.stock_status !== 'out_of_stock');
            setRelated(hasInStock ? sorted.slice(0, 8) : []);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  return { product, related, loading, error };
};

export const useCategories = () => {
  const [state, setState] = useState({ categories: [], loading: true, error: null });

  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, emoji, type')   // type added for vegetable/fruit grouping
      .eq('is_active', true)
      .order('display_order')
      .then(({ data, error: err }) => {
        setState({ categories: data || [], loading: false, error: err || null });
      });
  }, []);

  return state;
};

export const useOfferProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .not('offer_price', 'is', null)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProducts((data || []).filter((p) => p.offer_price < p.price));
        setLoading(false);
      });
  }, []);

  return { products, loading };
};
