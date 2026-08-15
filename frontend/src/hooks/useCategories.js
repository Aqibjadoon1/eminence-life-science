import { useState, useEffect } from 'react';
import { CategoryService } from '../services/CategoryService.js';

/**
 * Loads all categories from the DB — drives the navigation mega-menu,
 * shop sidebar, and concern tiles. Never reads from a hardcoded array.
 */
export function useCategories() {
  const [data,      setData]      = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    CategoryService.getAll()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error };
}

/**
 * Loads the distinct attribute key/value pairs for one category.
 * Used to build adaptive filter pills in the ShopPage sidebar.
 */
export function useCategoryAttributes(categorySlug) {
  const [data,      setData]      = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!categorySlug) { setData({}); return; }
    setIsLoading(true);
    CategoryService.getAttributesForCategory(categorySlug)
      .then((res) => setData(res.data))
      .catch(() => setData({}))
      .finally(() => setIsLoading(false));
  }, [categorySlug]);

  return { data, isLoading };
}
