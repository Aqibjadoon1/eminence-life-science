import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useAuthStore  from '../store/useAuthStore.js';
import useToastStore from '../store/useToastStore.js';
import { AdminProductService } from '../services/AdminProductService.js';
import ProductForm from '../components/admin/ProductForm.jsx';
import { canonicalUrl } from '../utils/seo.js';
import styles from './AdminPage.module.css';

export default function AdminPage() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = useAuthStore((s) => s.user?.is_admin === true);
  const navigate = useNavigate();

  const [view, setView] = useState('list');       // 'list' | 'add' | 'edit'
  const [editing, setEditing] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    if (isLoading) return; // wait for boot /me check before any redirect
    if (!isAdmin) navigate('/', { replace: true });
  }, [isLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isLoading || !isAdmin) return;
    AdminProductService.getAll()
      .then((r) => setProducts(r.data))
      .catch((err) => addToast(err.message || 'Could not load products.', 'error'))
      .finally(() => setLoading(false));
  }, [isLoading, isAdmin, addToast]);

  if (isLoading) return null;
  if (!isAdmin) return null;

  const refresh = () => AdminProductService.getAll().then((r) => setProducts(r.data));

  const handleToggle = async (p) => {
    try {
      await AdminProductService.toggleActive(p.id, !p.is_active);
      addToast(p.is_active ? `${p.name} hidden from storefront.` : `${p.name} is visible again.`, 'success');
      refresh();
    } catch (err) {
      addToast(err.message || 'Update failed.', 'error');
    }
  };

  const startEdit = (p) => { setEditing(p); setView('edit'); };
  const onSaved = () => { setView('list'); setEditing(null); refresh(); };

  return (
    <>
      <Helmet>
        <title>Admin — Eminence Life Science</title>
        <link rel="canonical" href={canonicalUrl('/admin')} />
      </Helmet>

      <div className={`container ${styles.page}`}>
        <div className={styles.header}>
          <span className="eyebrow">Admin</span>
          <h1 className={styles.title}>Product Manager</h1>
        </div>

        <div className={styles.tabs} role="tablist">
          <button role="tab" aria-selected={view === 'list'} className={`${styles.tab} ${view === 'list' ? styles.tabActive : ''}`} onClick={() => { setView('list'); setEditing(null); }}>Products</button>
          <button role="tab" aria-selected={view === 'add'} className={`${styles.tab} ${view === 'add' ? styles.tabActive : ''}`} onClick={() => { setView('add'); setEditing(null); }}>Add Product</button>
          {view === 'edit' && (
            <button role="tab" aria-selected className={`${styles.tab} ${styles.tabActive}`}>Edit Product</button>
          )}
        </div>

        {view === 'list' && (
          <div className={styles.listPanel}>
            {loading ? (
              <div className={styles.loading} aria-busy="true"><div className="skeleton" style={{ width: 260, height: 20 }} /></div>
            ) : products.length === 0 ? (
              <p className={styles.emptyText}>No products yet — add your first one above.</p>
            ) : (
              <div className={styles.listHead}>
                <span>Product</span><span>Status</span><span>Flags</span><span>Actions</span>
              </div>
            )}
            {products.map((p) => (
              <div key={p.id} className={`${styles.row} ${!p.is_active ? styles.rowHidden : ''}`}>
                <div className={styles.rowProduct}>
                  {p.image_urls?.[0] && <img src={p.image_urls[0]} alt="" width={44} height={52} className={styles.rowImg} />}
                  <div>
                    <span className={styles.rowName}>{p.name}</span>
                    <span className={styles.rowMeta}>{p.category_name} · stock {p.stock}</span>
                  </div>
                </div>
                <span className={`${styles.status} ${p.is_active ? styles.statusVisible : styles.statusHidden}`}>
                  {p.is_active ? 'Visible' : 'Hidden'}
                </span>
                <span className={styles.rowFlags}>
                  {p.is_featured && <span className={styles.flag}>Featured</span>}
                  {p.is_best_seller && <span className={styles.flag}>Best Seller</span>}
                </span>
                <div className={styles.rowActions}>
                  <button className="btn btn-ghost" onClick={() => startEdit(p)}>Edit</button>
                  <button className="btn btn-ghost" onClick={() => handleToggle(p)}>
                    {p.is_active ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(view === 'add' || view === 'edit') && (
          <ProductForm
            product={editing}
            onSaved={onSaved}
            onCancel={() => { setView('list'); setEditing(null); }}
          />
        )}
      </div>
    </>
  );
}
