/**
 * Seed script — inserts 3 concern categories + 12 realistic serum products.
 * Run: npm run db:seed
 */
import pool from './pool.js';
import dotenv from 'dotenv';

dotenv.config();

// ──────────────────────────────────────────────────────────────
//  CATEGORIES
// ──────────────────────────────────────────────────────────────
const categories = [
  { name: 'Brightening', slug: 'brightening' },
  { name: 'Anti-Aging',  slug: 'anti-aging'  },
  { name: 'Hydration',   slug: 'hydration'   },
  { name: 'Barrier Repair', slug: 'barrier-repair' },
];

// ──────────────────────────────────────────────────────────────
//  PRODUCTS  (12 serums across concern categories)
// ──────────────────────────────────────────────────────────────
// image_urls reference Unsplash for development placeholders
const products = [
  // ── BRIGHTENING ───────────────────────────────────────────
  {
    name: 'Luminance Vitamin C Serum',
    slug: 'luminance-vitamin-c-serum',
    description:
      'A potent 15% L-Ascorbic Acid serum stabilised with Vitamin E and Ferulic Acid. Visibly reduces dark spots, evens skin tone, and delivers a radiant, lit-from-within glow with daily use.',
    price: 4200,
    sale_price: null,
    sku: 'ELS-BR-001',
    stock: 85,
    category: 'brightening',
    concern_tags: ['brightening', 'hyperpigmentation', 'glow'],
    key_ingredients: ['15% L-Ascorbic Acid', 'Vitamin E', 'Ferulic Acid', 'Hyaluronic Acid'],
    how_to_use:
      'Apply 3–4 drops to cleansed skin in the morning before moisturiser. Always follow with broad-spectrum SPF. Avoid direct contact with eyes.',
    full_ingredient_list:
      'Aqua, Ascorbic Acid (15%), Tocopherol, Ferulic Acid, Sodium Hyaluronate, Panthenol, Niacinamide, Glycerin, Phenoxyethanol, Ethylhexylglycerin.',
    image_urls: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80',
    ],
    is_featured: true,
    is_best_seller: true,
  },
  {
    name: 'Clarity Kojic Acid Glow Serum',
    slug: 'clarity-kojic-acid-glow-serum',
    description:
      'A brightening serum combining Kojic Acid, Alpha Arbutin, and Niacinamide to visibly fade post-acne marks and uneven patches. Gentle enough for daily use on sensitive tones.',
    price: 3600,
    sale_price: 3100,
    sku: 'ELS-BR-002',
    stock: 120,
    category: 'brightening',
    concern_tags: ['brightening', 'dark-spots', 'post-acne'],
    key_ingredients: ['Kojic Acid', 'Alpha Arbutin 2%', 'Niacinamide 5%', 'Licorice Root Extract'],
    how_to_use:
      'Use morning and evening on clean skin. Apply 2–3 drops and gently press into face and neck. Follow with SPF in the morning.',
    full_ingredient_list:
      'Aqua, Niacinamide, Alpha-Arbutin, Kojic Acid, Glycyrrhiza Glabra (Licorice) Root Extract, Glycerin, Sodium Hyaluronate, Allantoin, Phenoxyethanol.',
    image_urls: [
      'https://images.unsplash.com/photo-1590502593747-42a996133562?w=1600&q=90',
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1600&q=90',
    ],
    is_featured: false,
    is_best_seller: true,
  },
  {
    name: 'Radiance AHA Resurfacing Serum',
    slug: 'radiance-aha-resurfacing-serum',
    description:
      'A weekly-use resurfacing serum with 10% Glycolic Acid and Lactic Acid. Gently exfoliates to reveal brighter, smoother skin and improve texture over time.',
    price: 3800,
    sale_price: null,
    sku: 'ELS-BR-003',
    stock: 65,
    category: 'brightening',
    concern_tags: ['brightening', 'texture', 'resurfacing'],
    key_ingredients: ['Glycolic Acid 7%', 'Lactic Acid 3%', 'Aloe Vera', 'Panthenol'],
    how_to_use:
      'Use 2–3 evenings per week on cleansed skin. Apply 3–4 drops, allow to absorb, then follow with moisturiser. Always use SPF the following morning.',
    full_ingredient_list:
      'Aqua, Glycolic Acid, Lactic Acid, Aloe Barbadensis Leaf Juice, Panthenol, Sodium Hyaluronate, Allantoin, Sodium Hydroxide, Phenoxyethanol.',
    image_urls: [
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    ],
    is_featured: false,
    is_best_seller: false,
  },

  // ── ANTI-AGING ────────────────────────────────────────────
  {
    name: 'Renewal Retinol 0.5% Night Serum',
    slug: 'renewal-retinol-night-serum',
    description:
      'A clinical-strength retinol serum encapsulated to minimise irritation while maximising cell turnover. Reduces the appearance of fine lines, wrinkles, and loss of firmness overnight.',
    price: 5200,
    sale_price: null,
    sku: 'ELS-AA-001',
    stock: 50,
    category: 'anti-aging',
    concern_tags: ['anti-aging', 'fine-lines', 'firmness', 'cell-turnover'],
    key_ingredients: ['Encapsulated Retinol 0.5%', 'Peptide Complex', 'Squalane', 'Vitamin E'],
    how_to_use:
      'PM use only. Apply 3 drops to clean, dry skin. Begin with 2x weekly, building to nightly as skin acclimates. Not suitable during pregnancy.',
    full_ingredient_list:
      'Cyclopentasiloxane, Dimethicone, Retinol (Encapsulated), Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7, Squalane, Tocopherol, BHT.',
    image_urls: [
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
    ],
    is_featured: true,
    is_best_seller: true,
  },
  {
    name: 'Lift & Firm Peptide Concentrate',
    slug: 'lift-firm-peptide-concentrate',
    description:
      'A concentrated blend of six bioactive peptides targeting elasticity, firmness, and the reduction of expression lines. Silky, fast-absorbing texture suitable for all ages.',
    price: 5800,
    sale_price: null,
    sku: 'ELS-AA-002',
    stock: 40,
    category: 'anti-aging',
    concern_tags: ['anti-aging', 'firmness', 'elasticity', 'peptides'],
    key_ingredients: [
      'Argireline® 10%', 'Leuphasyl®', 'Matrixyl 3000®', 'Copper Peptide GHK-Cu',
      'Hyaluronic Acid', 'Ceramides',
    ],
    how_to_use:
      'Apply morning and evening to cleansed skin. Gently press 4–5 drops into face, neck, and décolletage. Layer under moisturiser.',
    full_ingredient_list:
      'Aqua, Acetyl Hexapeptide-3, Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7, Copper Tripeptide-1, Pentapeptide-18, Sodium Hyaluronate, Ceramide NP, Glycerin, Phenoxyethanol.',
    image_urls: [
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=800&q=80',
    ],
    is_featured: true,
    is_best_seller: false,
  },
  {
    name: 'Time Reverse Bakuchiol Serum',
    slug: 'time-reverse-bakuchiol-serum',
    description:
      'A plant-powered retinol alternative. Bakuchiol delivers equivalent anti-aging results with zero irritation — safe for sensitive skin and during pregnancy.',
    price: 4500,
    sale_price: 3900,
    sku: 'ELS-AA-003',
    stock: 75,
    category: 'anti-aging',
    concern_tags: ['anti-aging', 'sensitive-skin', 'fine-lines'],
    key_ingredients: ['Bakuchiol 1%', 'Rosehip Oil', 'Sea Buckthorn', 'Vitamin C Derivative'],
    how_to_use:
      'Use morning or evening. Apply 3–4 drops to clean skin before moisturiser. Can be used daily without building tolerance.',
    full_ingredient_list:
      'Rosa Canina Fruit Oil, Hippophae Rhamnoides Oil, Bakuchiol, Ascorbyl Glucoside, Tocopherol, Bisabolol, Squalane.',
    image_urls: [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80',
    ],
    is_featured: false,
    is_best_seller: true,
  },

  // ── HYDRATION ─────────────────────────────────────────────
  {
    name: 'Aqua Surge Hyaluronic Acid Serum',
    slug: 'aqua-surge-hyaluronic-acid-serum',
    description:
      'Triple-weight Hyaluronic Acid delivers intense, multi-depth hydration. Leaves skin plump, dewy, and visibly smoothed. Fragrance-free and suitable for all skin types.',
    price: 3200,
    sale_price: null,
    sku: 'ELS-HY-001',
    stock: 150,
    category: 'hydration',
    concern_tags: ['hydration', 'plumping', 'dehydration'],
    key_ingredients: [
      'Triple-Weight Hyaluronic Acid', 'Sodium PCA', 'Aloe Vera', 'Panthenol',
    ],
    how_to_use:
      'Apply to damp skin morning and evening before oils and creams. Press 3–4 drops into face and neck. Lock in with a moisturiser immediately after.',
    full_ingredient_list:
      'Aqua, Sodium Hyaluronate (High/Medium/Low MW), Sodium PCA, Aloe Barbadensis Leaf Juice, Panthenol, Glycerin, Tremella Fuciformis Sporocarp Extract, Allantoin, Phenoxyethanol.',
    image_urls: [
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1600&q=90',
      'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=1600&q=90',
    ],
    is_featured: true,
    is_best_seller: true,
  },
  {
    name: 'Dew Drop Polyglutamic Acid Serum',
    slug: 'dew-drop-polyglutamic-acid-serum',
    description:
      'Polyglutamic Acid — 4x more hydrating than HA — forms a moisture-binding film on skin while stimulating Natural Moisturising Factor production. The ultimate dewy-skin serum.',
    price: 4800,
    sale_price: null,
    sku: 'ELS-HY-002',
    stock: 60,
    category: 'hydration',
    concern_tags: ['hydration', 'plumping', 'glow'],
    key_ingredients: ['Polyglutamic Acid', 'Tremella Mushroom Extract', 'Marine Collagen', 'Sodium Hyaluronate'],
    how_to_use:
      'Apply 2–3 drops to cleansed, damp skin morning and evening. Pat gently — do not rub. Follow immediately with moisturiser to seal in hydration.',
    full_ingredient_list:
      'Aqua, Polyglutamic Acid, Tremella Fuciformis Extract, Hydrolyzed Marine Collagen, Sodium Hyaluronate, Glycerin, Betaine, Niacinamide, Allantoin, Phenoxyethanol.',
    image_urls: [
      'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=1600&q=90',
    ],
    is_featured: false,
    is_best_seller: false,
  },
  {
    name: 'Oasis Squalane + Ceramide Serum',
    slug: 'oasis-squalane-ceramide-serum',
    description:
      'A rich but fast-absorbing serum that replenishes skin\'s natural lipid matrix. Squalane and three ceramide types restore the barrier function and prevent transepidermal water loss.',
    price: 4100,
    sale_price: 3600,
    sku: 'ELS-HY-003',
    stock: 90,
    category: 'hydration',
    concern_tags: ['hydration', 'barrier', 'dry-skin'],
    key_ingredients: ['Squalane', 'Ceramide NP', 'Ceramide AP', 'Ceramide EOP', 'Cholesterol'],
    how_to_use:
      'Apply as the last serum step, morning and evening. 3–4 drops warmed between palms and pressed gently into skin. Can be layered under face oil.',
    full_ingredient_list:
      'Squalane, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Sodium Hyaluronate, Tocopherol, Carbomer, Xanthan Gum.',
    image_urls: [
      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80',
    ],
    is_featured: false,
    is_best_seller: false,
  },

  // ── BARRIER REPAIR ────────────────────────────────────────
  {
    name: 'Shield Centella Calm Serum',
    slug: 'shield-centella-calm-serum',
    description:
      'A barrier-restoring serum centred on Centella Asiatica, Madecassoside, and Beta-Glucan. Calms redness, accelerates healing, and rebuilds skin resilience for sensitive or compromised skin.',
    price: 3900,
    sale_price: null,
    sku: 'ELS-BAR-001',
    stock: 80,
    category: 'barrier-repair',
    concern_tags: ['barrier', 'redness', 'sensitive-skin', 'calming'],
    key_ingredients: ['Centella Asiatica 5%', 'Madecassoside', 'Beta-Glucan', 'Panthenol', 'Allantoin'],
    how_to_use:
      'Apply morning and evening to clean skin. Use as a first serum step for best penetration. Ideal for use post-procedure or after exfoliation.',
    full_ingredient_list:
      'Aqua, Centella Asiatica Extract, Madecassoside, Beta-Glucan, Panthenol, Allantoin, Glycerin, Sodium Hyaluronate, Bisabolol, Phenoxyethanol.',
    image_urls: [
      'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80',
    ],
    is_featured: false,
    is_best_seller: false,
  },
  {
    name: 'Restore Probiotic Barrier Serum',
    slug: 'restore-probiotic-barrier-serum',
    description:
      'Lysate-based probiotic complex combined with prebiotic fibre and postbiotics to balance the skin microbiome, restore the acid mantle, and reduce chronic skin sensitivity.',
    price: 5500,
    sale_price: null,
    sku: 'ELS-BAR-002',
    stock: 35,
    category: 'barrier-repair',
    concern_tags: ['barrier', 'microbiome', 'sensitive-skin'],
    key_ingredients: ['Lactobacillus Ferment', 'Inulin (Prebiotic)', 'Postbiotic Complex', 'Ceramide NP', 'Niacinamide'],
    how_to_use:
      'Use morning and evening after cleansing. Apply 3–4 drops and press into skin. Allow 60 seconds to absorb before layering other products.',
    full_ingredient_list:
      'Aqua, Lactobacillus Ferment Lysate, Inulin, Lactobacillus/Oat Ferment Extract, Ceramide NP, Niacinamide, Panthenol, Sodium Hyaluronate, Phenoxyethanol.',
    image_urls: [
      'https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=800&q=80',
    ],
    is_featured: false,
    is_best_seller: false,
  },
  {
    name: 'Pure Balance Niacinamide 10% Serum',
    slug: 'pure-balance-niacinamide-serum',
    description:
      'A multi-tasking serum with 10% Niacinamide and 1% Zinc to regulate sebum, minimise pores, fade blemish marks, and reinforce the skin barrier — all in one step.',
    price: 2900,
    sale_price: null,
    sku: 'ELS-BAR-003',
    stock: 200,
    category: 'barrier-repair',
    concern_tags: ['barrier', 'pores', 'oily-skin', 'blemishes'],
    key_ingredients: ['Niacinamide 10%', 'Zinc PCA 1%', 'Hyaluronic Acid', 'Panthenol'],
    how_to_use:
      'Apply morning and/or evening to cleansed skin. Use 3–4 drops before heavier treatments. Compatible with most active ingredients.',
    full_ingredient_list:
      'Aqua, Niacinamide, Zinc PCA, Sodium Hyaluronate, Panthenol, Glycerin, Allantoin, Carbomer, Sodium Hydroxide, Phenoxyethanol.',
    image_urls: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    ],
    is_featured: true,
    is_best_seller: false,
  },
];

// ──────────────────────────────────────────────────────────────
//  SEED RUNNER
// ──────────────────────────────────────────────────────────────
async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding database...');
    await client.query('BEGIN');

    // Truncate in correct dependency order
    await client.query(`
      TRUNCATE newsletter_subscribers, order_items, orders, cart_items, carts,
               reviews, products, categories, addresses, users RESTART IDENTITY CASCADE
    `);

    // Insert categories and build slug → id map
    const categoryMap = {};
    for (const cat of categories) {
      const res = await client.query(
        'INSERT INTO categories(name, slug) VALUES($1, $2) RETURNING id',
        [cat.name, cat.slug]
      );
      categoryMap[cat.slug] = res.rows[0].id;
    }
    console.log('  ✅ Categories seeded:', Object.keys(categoryMap).join(', '));

    // Insert products
    for (const p of products) {
      await client.query(
        `INSERT INTO products (
           name, slug, description, price, sale_price, sku, stock,
           category_id, concern_tags, key_ingredients, how_to_use,
           full_ingredient_list, image_urls, is_featured, is_best_seller
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          p.name, p.slug, p.description,
          p.price, p.sale_price || null,
          p.sku, p.stock,
          categoryMap[p.category],
          p.concern_tags, p.key_ingredients,
          p.how_to_use, p.full_ingredient_list,
          p.image_urls, p.is_featured, p.is_best_seller,
        ]
      );
    }
    console.log(`  ✅ ${products.length} products seeded`);

    await client.query('COMMIT');
    console.log('✅ Seed complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
