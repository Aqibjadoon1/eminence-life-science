import { useEffect, useState } from 'react';
import useToastStore from '../../store/useToastStore.js';
import { AdminProductService } from '../../services/AdminProductService.js';
import { useCategories } from '../../hooks/useCategories.js';
import styles from './ProductForm.module.css';

const EMPTY = {
  name: '', category_id: '', price: '', stock: '', sku: '',
  description: '', how_to_use: '', full_ingredient_list: '',
  concern_tags: '', key_ingredients: '', image_urls: '',
  is_featured: false, is_best_seller: false, is_active: true,
};

function fromProduct(p) {
  return {
    name: p.name, category_id: p.category_id || '', price: p.price, stock: p.stock,
    sku: p.sku || '', description: p.description || '', how_to_use: p.how_to_use || '',
    full_ingredient_list: p.full_ingredient_list || '',
    concern_tags: (p.concern_tags || []).join(', '),
    key_ingredients: (p.key_ingredients || []).join(', '),
    image_urls: (p.image_urls || []).join('\n'),
    is_featured: p.is_featured, is_best_seller: p.is_best_seller, is_active: p.is_active,
  };
}

export default function ProductForm({ product, onSaved, onCancel }) {
  const { data: categories } = useCategories();
  const addToast = useToastStore((s) => s.addToast);
  const [f, setF] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setF(product ? fromProduct(product) : EMPTY);
  }, [product]);

  const set = (key) => (e) => setF((prev) => ({ ...prev, [key]: e.target.value }));
  const setBool = (key) => (e) => setF((prev) => ({ ...prev, [key]: e.target.checked }));

  const split = (s) => s.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || !f.category_id || f.price === '') {
      addToast('Name, category and price are required.', 'error');
      return;
    }
    const payload = {
      name: f.name.trim(), category_id: f.category_id,
      price: Number(f.price), stock: f.stock === '' ? 0 : Number(f.stock),
      sku: f.sku.trim(), description: f.description.trim(),
      how_to_use: f.how_to_use.trim(), full_ingredient_list: f.full_ingredient_list.trim(),
      concern_tags: split(f.concern_tags), key_ingredients: split(f.key_ingredients),
      image_urls: f.image_urls.split('\n').map((x) => x.trim()).filter(Boolean),
      is_featured: f.is_featured, is_best_seller: f.is_best_seller,
      is_active: f.is_active,
    };
    setSubmitting(true);
    try {
      if (product) await AdminProductService.update(product.id, payload);
      else await AdminProductService.create(payload);
      addToast(product ? 'Product updated.' : 'Product added to the store.', 'success');
      onSaved();
    } catch (err) {
      addToast(err.message || 'Save failed — please check the fields.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="pf-name" className={styles.label}>Product Name <span aria-hidden="true">*</span></label>
          <input id="pf-name" type="text" value={f.name} onChange={set('name')} className={styles.input} placeholder="e.g. Vitamin C Radiance Serum" required />
        </div>

        <div className={styles.field}>
          <label htmlFor="pf-cat" className={styles.label}>Category <span aria-hidden="true">*</span></label>
          <select id="pf-cat" value={f.category_id} onChange={set('category_id')} className={styles.input} required>
            <option value="">Choose a category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="pf-price" className={styles.label}>
            Price (record only — never shown to shoppers) <span aria-hidden="true">*</span>
          </label>
          <input id="pf-price" type="number" min="0" step="0.01" value={f.price} onChange={set('price')} className={styles.input} placeholder="0" required />
        </div>

        <div className={styles.field}>
          <label htmlFor="pf-stock" className={styles.label}>Stock</label>
          <input id="pf-stock" type="number" min="0" value={f.stock} onChange={set('stock')} className={styles.input} placeholder="0" />
        </div>

        <div className={styles.field}>
          <label htmlFor="pf-sku" className={styles.label}>SKU (optional — auto-generated if blank)</label>
          <input id="pf-sku" type="text" value={f.sku} onChange={set('sku')} className={styles.input} placeholder="Auto from name" />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="pf-desc" className={styles.label}>Description</label>
        <textarea id="pf-desc" value={f.description} onChange={set('description')} className={styles.textarea} rows={4} placeholder="What makes this product special…" />
      </div>

      <div className={styles.field}>
        <label htmlFor="pf-use" className={styles.label}>How to Use</label>
        <textarea id="pf-use" value={f.how_to_use} onChange={set('how_to_use')} className={styles.textarea} rows={3} placeholder="Step-by-step usage…" />
      </div>

      <div className={styles.field}>
        <label htmlFor="pf-ing" className={styles.label}>Full Ingredient List</label>
        <textarea id="pf-ing" value={f.full_ingredient_list} onChange={set('full_ingredient_list')} className={styles.textarea} rows={3} placeholder="Comma-separated ingredients…" />
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="pf-tags" className={styles.label}>Concern Tags (comma separated)</label>
          <input id="pf-tags" type="text" value={f.concern_tags} onChange={set('concern_tags')} className={styles.input} placeholder="brightening, hydration" />
        </div>
        <div className={styles.field}>
          <label htmlFor="pf-keys" className={styles.label}>Key Ingredients (comma separated)</label>
          <input id="pf-keys" type="text" value={f.key_ingredients} onChange={set('key_ingredients')} className={styles.input} placeholder="Vitamin C, Hyaluronic Acid" />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="pf-imgs" className={styles.label}>Image URLs (one per line)</label>
        <textarea id="pf-imgs" value={f.image_urls} onChange={set('image_urls')} className={styles.textarea} rows={3} placeholder={'https://…/image-1.jpg\nhttps://…/image-2.jpg'} />
        {f.image_urls.trim() && (
          <div className={styles.previewRow}>
            {f.image_urls.split('\n').map((u, i) => u.trim() && (
              <img key={i} src={u.trim()} alt={`preview ${i + 1}`} width={56} height={66} className={styles.previewImg} onError={(e) => { e.currentTarget.style.opacity = '0.25'; }} />
            ))}
          </div>
        )}
      </div>

      <div className={styles.toggles}>
        <label className={styles.toggle}>
          <input type="checkbox" checked={f.is_featured} onChange={setBool('is_featured')} />
          <span>Featured on home</span>
        </label>
        <label className={styles.toggle}>
          <input type="checkbox" checked={f.is_best_seller} onChange={setBool('is_best_seller')} />
          <span>Best seller</span>
        </label>
        {product && (
          <label className={styles.toggle}>
            <input type="checkbox" checked={f.is_active} onChange={setBool('is_active')} />
            <span>Visible in storefront</span>
          </label>
        )}
      </div>

      <div className={styles.actions}>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : product ? 'Save Changes' : 'Add Product'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
