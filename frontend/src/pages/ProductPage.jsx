import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProduct } from '../hooks/useProducts.js';
import useCartStore  from '../store/useCartStore.js';
import useToastStore from '../store/useToastStore.js';
import { formatPrice } from '../utils/formatting.js';
import ProductCard from '../components/cards/ProductCard.jsx';
import { canonicalUrl } from '../utils/seo.js';
import styles from './ProductPage.module.css';

export default function ProductPage() {
  const { slug } = useParams();
  const { data: product, isLoading, error } = useProduct(slug);

  const [activeImage, setActiveImage]   = useState(0);
  const [quantity,    setQuantity]      = useState(1);
  const [openTab,     setOpenTab]       = useState('ingredients');
  const [addingToCart, setAddingToCart] = useState(false);

  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const addToast = useToastStore((s) => s.addToast);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    await addItem(product.id, quantity);
    addToast(`${product.name} added to cart`, 'success');
    openCart();
    setAddingToCart(false);
  };

  if (isLoading) return <ProductPageSkeleton />;
  if (error || !product) return (
    <>
      {/* SPA soft-404 — keep out of the index */}
      <Helmet>
        <title>Product Not Found — Eminence Life Science</title>
        <meta name="robots" content="noindex,follow" />
      </Helmet>
      <div className={styles.error}>
        <p>Product not found.</p>
        <Link to="/shop" className="btn btn-outline">Back to Shop</Link>
      </div>
    </>
  );

  const images = product.image_urls?.length ? product.image_urls : [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80'
  ];

  const TABS = [
    { id: 'ingredients',  label: 'Key Ingredients' },
    { id: 'how-to-use',   label: 'How to Use'      },
    { id: 'full-list',    label: 'Full Ingredient List' },
    { id: 'reviews',      label: `Reviews (${product.review_count || 0})` },
  ];

  return (
    <>
      <Helmet>
        <title>{product.name} — Eminence Life Science</title>
        <meta name="description" content={product.description?.slice(0, 155)} />
        <link rel="canonical" href={canonicalUrl(`/product/${slug}`)} />
      </Helmet>

      {/* Main product layout */}
      <div className={`container ${styles.product}`}>
        {/* Gallery */}
        <div className={styles.gallery}>
          {/* Main image */}
          <div className={styles.mainImage}>
            <img
              src={images[activeImage]}
              alt={product.name}
              width={640}
              height={720}
              className={styles.mainImg}
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className={styles.thumbnails} role="list" aria-label="Product images">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === activeImage ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={i === activeImage}
                  role="listitem"
                >
                  <img src={img} alt="" width={80} height={96} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className={styles.info}>
          {/* Category + concern tags */}
          <div className={styles.tags}>
            {product.concern_tags?.map((tag) => (
              <span key={tag} className="concern-tag">{tag}</span>
            ))}
          </div>

          <h1 className={styles.name}>{product.name}</h1>

          {/* Rating */}
          {Number(product.review_count) > 0 && (
            <div className={styles.rating}>
              {[1,2,3,4,5].map((s) => (
                <StarIcon key={s} filled={s <= Math.round(product.avg_rating)} />
              ))}
              <span className={styles.ratingText}>
                {Number(product.avg_rating).toFixed(1)} ({product.review_count} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className={styles.priceBlock}>
            {product.sale_price ? (
              <>
                <span className={`price price-sale ${styles.price}`}>{formatPrice(product.sale_price)}</span>
                <span className={`price price-original`}>{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className={`price ${styles.price}`}>{formatPrice(product.price)}</span>
            )}
          </div>

          <hr className="hairline" />

          {/* Description */}
          <p className={styles.description}>{product.description}</p>

          {/* Category-specific attributes — rendered generically for any product type */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className={styles.attrGrid} aria-label="Product specifications">
              {Object.entries(product.attributes)
                .filter(([, v]) => v)
                .map(([key, value]) => (
                  <div key={key} className={styles.attrItem}>
                    <span className={styles.attrKey}>
                      {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                    <span className={styles.attrValue}>{value}</span>
                  </div>
                ))
              }
            </div>
          )}

          {/* Quantity + Add to cart */}
          <div className={styles.addRow}>
            <div className={styles.qty}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
              >−</button>
              <span aria-live="polite">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                aria-label="Increase quantity"
                disabled={quantity >= product.stock}
              >+</button>
            </div>

            <button
              className={`btn btn-primary ${styles.addBtn}`}
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              aria-label={`Add ${quantity} × ${product.name} to cart`}
            >
              {product.stock === 0
                ? 'Out of Stock'
                : addingToCart
                  ? 'Adding…'
                  : 'Add to Cart'}
            </button>
          </div>

          {product.stock > 0 && product.stock < 10 && (
            <p className={styles.stockWarning}>
              Only {product.stock} left in stock
            </p>
          )}
        </div>
      </div>

      {/* Accordion tabs */}
      <div className={`container ${styles.tabs}`}>
        <div className={styles.tabHeaders} role="tablist" aria-label="Product details">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={openTab === tab.id}
              aria-controls={`tab-panel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`${styles.tabBtn} ${openTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setOpenTab(openTab === tab.id ? null : tab.id)}
            >
              {tab.label}
              <ChevronIcon open={openTab === tab.id} />
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div
          id="tab-panel-ingredients"
          role="tabpanel"
          aria-labelledby="tab-ingredients"
          hidden={openTab !== 'ingredients'}
          className={styles.tabPanel}
        >
          <ul className={styles.ingredientList}>
            {product.key_ingredients?.map((ing) => (
              <li key={ing} className={styles.ingredientItem}>
                <span className={styles.ingredientDot} aria-hidden="true" />
                {ing}
              </li>
            ))}
          </ul>
        </div>

        <div
          id="tab-panel-how-to-use"
          role="tabpanel"
          aria-labelledby="tab-how-to-use"
          hidden={openTab !== 'how-to-use'}
          className={styles.tabPanel}
        >
          <p className={styles.tabText}>{product.how_to_use}</p>
        </div>

        <div
          id="tab-panel-full-list"
          role="tabpanel"
          aria-labelledby="tab-full-list"
          hidden={openTab !== 'full-list'}
          className={styles.tabPanel}
        >
          <p className={`${styles.tabText} ${styles.ingredientListText}`}>
            {product.full_ingredient_list}
          </p>
        </div>

        <div
          id="tab-panel-reviews"
          role="tabpanel"
          aria-labelledby="tab-reviews"
          hidden={openTab !== 'reviews'}
          className={styles.tabPanel}
        >
          {!product.reviews?.length ? (
            <p className={styles.tabText}>No reviews yet. Be the first to share your experience.</p>
          ) : (
            <div className={styles.reviews}>
              {product.reviews.map((r) => (
                <div key={r.id} className={styles.review}>
                  <div className={styles.reviewHeader}>
                    <span className={styles.reviewerName}>{r.reviewer_name || 'Verified Customer'}</span>
                    <div className={styles.reviewStars} aria-label={`${r.rating} out of 5`}>
                      {[1,2,3,4,5].map((s) => (
                        <StarIcon key={s} filled={s <= r.rating} small />
                      ))}
                    </div>
                  </div>
                  <p className={styles.reviewComment}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related products — loaded lazily */}
      <RelatedProducts slug={slug} currentId={product.id} />
    </>
  );
}

// ── Related Products ────────────────────────────────────────
import { useEffect, useState as useStateRelated } from 'react';
import { ProductService } from '../services/ProductService.js';

function RelatedProducts({ slug }) {
  const [related, setRelated] = useStateRelated([]);

  useEffect(() => {
    ProductService.getRelated(slug)
      .then((res) => setRelated(res.data))
      .catch(() => {});
  }, [slug]);

  if (!related.length) return null;

  return (
    <section className={`section ${styles.relatedSection}`} aria-labelledby="related-heading">
      <div className="container">
        <div className={styles.relatedHeader}>
          <span className="eyebrow">Complete the Ritual</span>
          <h2 id="related-heading" className={styles.relatedHeading}>You May Also Like</h2>
        </div>
        <div className={styles.relatedGrid}>
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Skeleton ────────────────────────────────────────────────
function ProductPageSkeleton() {
  return (
    <div className={`container ${styles.skeleton}`} aria-hidden="true" aria-busy="true">
      <div className={styles.skeletonGallery}>
        <div className={`skeleton ${styles.skeletonMainImg}`} />
      </div>
      <div className={styles.skeletonInfo}>
        <div className={`skeleton ${styles.skeletonLine}`} style={{width:'40%', height:'12px'}} />
        <div className={`skeleton ${styles.skeletonLine}`} style={{width:'80%', height:'32px'}} />
        <div className={`skeleton ${styles.skeletonLine}`} style={{width:'30%', height:'18px'}} />
        <div className={`skeleton ${styles.skeletonLine}`} style={{width:'100%', height:'80px'}} />
      </div>
    </div>
  );
}

// ── Micro icons ─────────────────────────────────────────────
function StarIcon({ filled, small }) {
  return (
    <svg
      width={small ? 12 : 16}
      height={small ? 12 : 16}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="16" height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms' }}
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
