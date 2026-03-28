import { useState, useEffect, useMemo } from 'react';
import {
  CATEGORIES,
  ENRICHED_PRODUCTS,
  getFeaturedProducts,
  getOfferProducts,
  searchProducts,
} from '../data/mockData';

const LOADING_DELAY = 800;

export const useProducts = (filters = {}) => {
  const { category_id, search, is_featured, limit } = filters;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), LOADING_DELAY);
    return () => clearTimeout(t);
  }, [category_id, search, is_featured, limit]);

  const products = useMemo(() => {
    let result = ENRICHED_PRODUCTS;
    if (is_featured) {
      result = getFeaturedProducts();
    } else if (search) {
      result = searchProducts(search);
    } else if (category_id) {
      result = result.filter((p) => p.category_id === category_id);
    }
    if (limit) result = result.slice(0, limit);
    return result;
  }, [category_id, search, is_featured, limit]);

  return { products, loading, error: null, refetch: () => {} };
};

export const useProduct = (id) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), LOADING_DELAY);
    return () => clearTimeout(t);
  }, [id]);

  const product = useMemo(
    () => ENRICHED_PRODUCTS.find((p) => p.id === id) ?? null,
    [id]
  );

  const related = useMemo(() => {
    if (!product) return [];
    return ENRICHED_PRODUCTS.filter(
      (p) => p.category_id === product.category_id && p.id !== id
    ).slice(0, 8);
  }, [product, id]);

  return { product, related, loading, error: null };
};

export const useCategories = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), LOADING_DELAY);
    return () => clearTimeout(t);
  }, []);

  return { categories: CATEGORIES, loading, error: null };
};

export const useOfferProducts = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), LOADING_DELAY);
    return () => clearTimeout(t);
  }, []);

  return { products: getOfferProducts(), loading, error: null };
};
