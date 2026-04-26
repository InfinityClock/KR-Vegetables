import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const PRODUCT_SELECT = `
  id, name, tamil_name, description, unit, price, offer_price,
  offer_label, image_url, stock_status, is_featured, is_active,
  category_id, categories(id, name, emoji)
`.trim();

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

        if (category_id) q = q.eq('category_id', category_id);
        if (is_featured)  q = q.eq('is_featured', true);
        if (search)       q = q.ilike('name', `%${search}%`);
        if (sort === 'offers') q = q.not('offer_price', 'is', null);

        q = q.order('created_at', { ascending: false });
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
            .limit(8);
          if (!cancelled) setRelated(rel || []);
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
      .select('id, name, emoji')
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
