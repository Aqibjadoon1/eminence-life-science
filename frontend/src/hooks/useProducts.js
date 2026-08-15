import { useState, useEffect, useCallback } from 'react';
import { ProductService } from '../services/ProductService.js';

export function useProducts(params = {}) {
  const [data, setData]         = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState(null);

  const key = JSON.stringify(params);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ProductService.getAll(params);
      setData(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, pagination, isLoading, error, refetch: fetch };
}

export function useProduct(slug) {
  const [data, setData]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    ProductService.getBySlug(slug)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [slug]);

  return { data, isLoading, error };
}

export function useBestSellers() {
  const [data, setData]         = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ProductService.getBestSellers()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export function useFeaturedProducts() {
  const [data, setData]         = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ProductService.getFeatured()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}
