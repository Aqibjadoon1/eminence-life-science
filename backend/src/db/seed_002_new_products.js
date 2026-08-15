/**
 * Seed 002 — Add new product categories and real products from asset scan.
 * NON-DESTRUCTIVE: uses INSERT … ON CONFLICT DO NOTHING for categories,
 * and skips any product whose SKU already exists.
 *
 * Products sourced from physical packaging images + literature card.
 * Fields marked needs_review:true have incomplete retail pricing or are
 * physician samples — they are seeded with is_active:false until confirmed.
 *
 * Run: node src/db/seed_002_new_products.js
 */
import pool from './pool.js';
import dotenv from 'dotenv';
dotenv.config();

// ─────────────────────────────────────────────────────────────────────────────
//  NEW CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
const NEW_CATEGORIES = [
  {
    name: 'Soaps & Bars',
    slug: 'soaps',
    description: 'Medicated and therapeutic bar soaps formulated for specific skin conditions — from anti-acne to dry skin relief.',
    image_url: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800&q=80',
    sort_order: 5,
  },
  {
    name: 'Face Washes',
    slug: 'face-washes',
    description: 'Gentle yet effective cleansers engineered to remove impurities without stripping the skin\'s natural moisture barrier.',
    image_url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80',
    sort_order: 6,
  },
  {
    name: 'Emollients & Moisturizers',
    slug: 'emollients',
    description: 'Rich emollient formulas and lightweight lotion moisturizers that restore suppleness and protect the skin barrier.',
    image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80',
    sort_order: 7,
  },
  {
    name: 'Sunblock',
    slug: 'sunblock',
    description: 'Advanced broad-spectrum hybrid sunscreens with antioxidant actives for complete UVA/UVB protection.',
    image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    sort_order: 8,
  },
  {
    name: 'Hair Care',
    slug: 'hair-care',
    description: 'Clinically formulated hair oils and shampoos targeting hair fall, scalp health, and follicle nourishment.',
    image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    sort_order: 9,
  },
  {
    name: 'Medicated Specialty',
    slug: 'medicated',
    description: 'Targeted medicated formulations for scalp conditions, fungal issues, and dermatological skin concerns.',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    sort_order: 10,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  NEW PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────
const NEW_PRODUCTS = [

  // ── SOAPS & BARS ──────────────────────────────────────────────────────────
  {
    name: 'Anti Acne Bar',
    slug: 'eminence-anti-acne-bar',
    description:
      'A dermatologist-formulated medicated bar soap designed for oily and acne-prone skin. Mandelic and Glycolic Acid exfoliate congested pores while Tea Tree Oil delivers targeted antibacterial action. Produces a rich lather that deep-cleans without stripping.',
    price: 650,
    sale_price: null,
    sku: 'ELS-SOAP-001',
    stock: 120,
    category: 'soaps',
    concern_tags: ['acne', 'oily-skin', 'pores', 'breakouts'],
    key_ingredients: ['Mandelic Acid', 'Glycolic Acid', 'Tea Tree Oil', 'Aloe Vera'],
    how_to_use:
      'Cover all affected areas with rich lather. Leave on for a few minutes, then rinse thoroughly with water. Use twice daily or as directed by physician. Avoid contact with eyes — rinse immediately with fresh water if lather enters eyes.',
    full_ingredient_list:
      'Aqua, Sodium Palmate, Sodium Palm Kernelate, Sodium Polyacrylate, Sodium Alkylethersulfate, Tea Tree Oil, Mandelic Acid, Glycolic Acid, Aloe Barbadensis Leaf Extract, Glycerin, Titanium Dioxide, EDTA.',
    image_urls: ['IMG-20260814-WA0020.jpg'],
    is_featured: true,
    is_best_seller: true,
    needs_review: false,
    is_active: true,
    attributes: [
      { key: 'bar_weight_gm',      value: '75' },
      { key: 'skin_type',          value: 'Oily & Acne Prone' },
      { key: 'format',             value: 'Bar Soap' },
      { key: 'use_area',           value: 'Face & Body' },
      { key: 'manufacturer',       value: 'Derma-Ect (Pvt) Ltd.' },
    ],
  },
  {
    name: 'TrySCAB Medicated Bar',
    slug: 'tryscab-medicated-bar',
    description:
      'A medicated therapeutic bar formulated with Coal Tar, Arachis Oil, and Cade Oil for the treatment of Tinea Versicolor, Acne/Oily Skin, Scabies, and Seborrhoea. Use with lukewarm water — prepare sufficient lather, leave on affected areas for a few minutes, then rinse thoroughly.',
    price: 750,
    sale_price: null,
    sku: 'ELS-SOAP-002',
    stock: 80,
    category: 'soaps',
    concern_tags: ['tinea-versicolor', 'acne', 'scabies', 'seborrhoea', 'fungal'],
    key_ingredients: ['Coal Tar 1.2%', 'Arachis Oil 0.3%', 'Cade Oil 0.4%'],
    how_to_use:
      'Use with lukewarm water. Prepare sufficient lather, leave the affected parts of the skin covered for a few minutes, then rinse thoroughly. Use twice or thrice daily, or as recommended by physician. For external use only.',
    full_ingredient_list:
      'Coal Tar 1.2%, Arachis Oil 0.3%, Cade Oil 0.4%, Soap Base (Sodium Palmate, Sodium Palm Kernelate, Aqua, Glycerin, Sodium Chloride, Titanium Dioxide).',
    image_urls: ['IMG-20260814-WA0022.jpg'],
    is_featured: false,
    is_best_seller: false,
    needs_review: false,
    is_active: true,
    attributes: [
      { key: 'bar_weight_gm',      value: '75' },
      { key: 'skin_type',          value: 'Oily, Acne Prone, Sensitive' },
      { key: 'format',             value: 'Medicated Bar' },
      { key: 'use_area',           value: 'Face & Body' },
      { key: 'manufacturer',       value: 'DM Life Science Lahore' },
    ],
  },
  {
    name: 'Mastic-E Medicated Bar',
    slug: 'mastic-e-medicated-bar',
    description:
      'A gentle medicated bar formulated exclusively for dry skin. The Mineral Oil and Olive Oil base, combined with Bees Wax and Aloe Vera, restores normal skin texture, maintains the skin\'s natural moisture, and leaves skin feeling soft and supple after every wash.',
    price: 700,
    sale_price: null,
    sku: 'ELS-SOAP-003',
    stock: 95,
    category: 'soaps',
    concern_tags: ['dry-skin', 'moisture', 'gentle', 'barrier'],
    key_ingredients: ['Mineral Oil', 'Olive Oil', 'Bees Wax', 'Aloe Vera', 'Glycerine'],
    how_to_use:
      'Wet skin with lukewarm water. Work into a lather and apply to face and body. Leave for 1–2 minutes then rinse thoroughly. For external use only. Pat dry gently after use.',
    full_ingredient_list:
      'Mineral Oil, Olive Oil, Bees Wax, Emulgin, Glycerine, Aloe Barbadensis Leaf Extract, Sodium Palmate, Sodium Palm Kernelate, Aqua, Sodium Chloride, Titanium Dioxide.',
    image_urls: ['IMG-20260814-WA0039.jpg'],
    is_featured: false,
    is_best_seller: true,
    needs_review: false,
    is_active: true,
    attributes: [
      { key: 'bar_weight_gm',      value: '75' },
      { key: 'skin_type',          value: 'Dry Skin' },
      { key: 'format',             value: 'Medicated Bar' },
      { key: 'use_area',           value: 'Face & Body' },
      { key: 'manufacturer',       value: 'Derma Mastic — Life Science Lahore' },
    ],
  },

  // ── FACE WASHES ───────────────────────────────────────────────────────────
  {
    name: 'Anti Acne Face Wash',
    slug: 'eminence-anti-acne-face-wash',
    description:
      'A non-comedogenic, dermatologist-tested face wash that gently cleans and removes excess oil without over-drying. Mandelic and Glycolic Acid exfoliate and decongest pores while Tea Tree Oil neutralises acne-causing bacteria. Suitable for all skin types — gentle enough for daily use morning and evening.',
    price: 1200,
    sale_price: null,
    sku: 'ELS-FW-001',
    stock: 140,
    category: 'face-washes',
    concern_tags: ['acne', 'oily-skin', 'pores', 'breakouts', 'texture'],
    key_ingredients: ['Mandelic Acid', 'Glycolic Acid', 'Tea Tree Oil', 'Aloe Vera', 'Sodium Alkylethersulfate'],
    how_to_use:
      'Apply a small amount to damp face. Massage gently in circular motions for 30–60 seconds. Rinse thoroughly with lukewarm water. Use morning and evening. Follow with a suitable moisturiser.',
    full_ingredient_list:
      'Aqua, Ethylenediamine Tetraacetic Acid (EDTA), Sodium Polyacrylate, Sodium Alkylethersulfate, Tea Tree Oil, Mandelic Acid, Glycolic Acid, Aloe Barbadensis Leaf Extract, Glycerin, Panthenol, Phenoxyethanol.',
    image_urls: ['IMG-20260814-WA0027.jpg'],
    is_featured: true,
    is_best_seller: true,
    needs_review: false,
    is_active: true,
    attributes: [
      { key: 'volume_ml',          value: '70' },
      { key: 'skin_type',          value: 'All Skin Types' },
      { key: 'format',             value: 'Gel Wash' },
      { key: 'use_frequency',      value: 'Morning & Evening' },
      { key: 'non_comedogenic',    value: 'Yes' },
      { key: 'dermatologist_tested', value: 'Yes' },
    ],
  },
  {
    name: 'Glo Brightening Face Wash',
    slug: 'eminence-glo-brightening-face-wash',
    description:
      'A dual-action brightening cleanser and light treatment in one step. Glycolic and Lactic Acid gently resurface and even skin tone with every wash, while Vitamin E and Citric Acid antioxidants protect against environmental dullness. Leaves skin visibly clearer and more luminous.',
    price: 1400,
    sale_price: null,
    sku: 'ELS-FW-002',
    stock: 100,
    category: 'face-washes',
    concern_tags: ['brightening', 'glow', 'texture', 'hyperpigmentation'],
    key_ingredients: ['Glycolic Acid', 'Lactic Acid', 'Vitamin E', 'Citric Acid', 'PEG-30 Hydrogenated Castor Oil'],
    how_to_use:
      'Apply to damp skin and massage gently. Leave for 60 seconds to allow actives to work, then rinse thoroughly. Use morning and/or evening. Follow with SPF in the morning.',
    full_ingredient_list:
      'Aqua, EDTA, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Propylene Glycol, PEG-30 Hydrogenated Castor Oil, Tocopherol (Vitamin E), Lactic Acid, Glycolic Acid, Citric Acid, Phenoxyethanol, Ethylhexylglycerin.',
    image_urls: [
      'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80',
    ],
    is_featured: false,
    is_best_seller: false,
    needs_review: false,
    is_active: true,
    attributes: [
      { key: 'skin_type',          value: 'All Skin Types' },
      { key: 'format',             value: 'Cream-Gel Wash' },
      { key: 'use_frequency',      value: 'Morning & Evening' },
      { key: 'key_benefit',        value: 'Brightening' },
    ],
  },

  // ── EMOLLIENTS & MOISTURIZERS ─────────────────────────────────────────────
  {
    name: 'Mastic-E Emollient Cream',
    slug: 'mastic-e-emollient-cream',
    description:
      'An intensive extra-rich emollient cream that soothes, protects, and helps retain the skin\'s natural suppleness. The Mineral Oil and Olive Oil base combined with Bees Wax forms a protective occlusive layer that locks in moisture and relieves all dry skin conditions. Ideal for severely dry, rough, or flaky skin.',
    price: 950,
    sale_price: null,
    sku: 'ELS-MOI-001',
    stock: 110,
    category: 'emollients',
    concern_tags: ['dry-skin', 'barrier', 'soothing', 'moisture', 'eczema'],
    key_ingredients: ['Mineral Oil', 'Olive Oil', 'Bees Wax', 'Glycerine', 'Aloe Vera', 'Emulgin'],
    how_to_use:
      'Apply liberally to cleansed skin as needed. Gently massage until absorbed. Can be used on face and body. For severely dry areas, apply a generous layer before bedtime and allow to absorb overnight.',
    full_ingredient_list:
      'Mineral Oil, Olive Oil, Bees Wax, Emulgin (Glyceryl Stearate), Glycerine, Aloe Barbadensis Leaf Extract, Cetyl Alcohol, Sodium Benzoate, Propylene Glycol, Aqua.',
    image_urls: ['IMG-20260814-WA0033.jpg'],
    is_featured: false,
    is_best_seller: true,
    needs_review: false,
    is_active: true,
    attributes: [
      { key: 'format',             value: 'Rich Cream' },
      { key: 'skin_type',          value: 'Dry to Very Dry' },
      { key: 'use_area',           value: 'Face & Body' },
      { key: 'manufacturer',       value: 'DM Life Science Lahore' },
    ],
  },
  {
    name: 'Mastic-E Oil Free Moisturizer SPF 20',
    slug: 'mastic-e-moisturizer-spf20',
    description:
      'A lightweight, oil-free daily moisturizer with built-in SPF 20 broad-spectrum sunscreen. The non-comedogenic formula provides 24-hour hydration while restoring the skin\'s protective barrier — without any greasy residue. Suitable for all dry skin disorders and daily use under makeup.',
    price: 1500,
    sale_price: null,
    sku: 'ELS-MOI-002',
    stock: 85,
    category: 'emollients',
    concern_tags: ['dry-skin', 'moisture', 'barrier', 'sun-protection'],
    key_ingredients: ['Mineral Oil', 'Olive Oil', 'Bees Wax', 'Glycerine', 'Titanium Dioxide (SPF)'],
    how_to_use:
      'Apply to cleansed face and neck every morning after serum. Blend gently until absorbed. Reapply as needed throughout the day for continued sun protection.',
    full_ingredient_list:
      'Aqua, Mineral Oil, Olive Oil, Bees Wax, Emulgin, Glycerine, Aloe Barbadensis Leaf Extract, Titanium Dioxide, Dimethicone, Cetyl Alcohol, Propylene Glycol, Phenoxyethanol.',
    image_urls: ['IMG-20260814-WA0029.jpg'],
    is_featured: true,
    is_best_seller: false,
    needs_review: false,
    is_active: true,
    attributes: [
      { key: 'volume_ml',          value: '150' },
      { key: 'spf_value',          value: '20' },
      { key: 'format',             value: 'Lotion' },
      { key: 'skin_type',          value: 'All Dry Skin Types' },
      { key: 'non_comedogenic',    value: 'Yes' },
      { key: 'spf_spectrum',       value: 'Broad Spectrum' },
    ],
  },

  // ── SUNBLOCK ──────────────────────────────────────────────────────────────
  {
    name: 'Antioxidant Sunblock SPF 60 PA+++',
    slug: 'eminence-sunblock-spf60',
    description:
      'An advanced hybrid broad-spectrum sunscreen combining chemical and physical UV filters with antioxidant actives. SPF 60 PA+++ shields against UVA, UVB, and UVA2 radiation while Hyaluronic Acid and Vitamin E hydrate and protect against free radical damage. Invisible, non-greasy, water-resistant finish — wears seamlessly under makeup.',
    price: 1800,
    sale_price: null,
    sku: 'ELS-SUN-001',
    stock: 60,
    category: 'sunblock',
    concern_tags: ['sun-protection', 'anti-aging', 'brightening', 'hydration'],
    key_ingredients: ['Titanium Dioxide', 'Hyaluronic Acid', 'Vitamin E', 'Glycerine', 'Triglaceride', 'Aloe Vera'],
    how_to_use:
      'Apply generously to face and exposed skin 15–20 minutes before sun exposure. Reapply every 2 hours or after swimming/sweating. Use as the final step in your morning skincare routine, after moisturiser and before makeup.',
    full_ingredient_list:
      'Aqua, Glycerine, Titanium Dioxide, Sodium Hyaluronate, Tocopherol (Vitamin E), Caprylic/Capric Triglyceride, Aloe Barbadensis Leaf Extract, Dimethicone, Cyclopentasiloxane, Phenoxyethanol, Ethylhexylglycerin.',
    image_urls: ['IMG-20260814-WA0025.jpg'],
    is_featured: true,
    is_best_seller: false,
    // Physician's sample image — seeding as active but flagging for pricing confirmation
    needs_review: true,
    is_active: true,
    attributes: [
      { key: 'volume_ml',          value: '30' },
      { key: 'spf_value',          value: '60' },
      { key: 'pa_rating',          value: 'PA+++' },
      { key: 'spf_spectrum',       value: 'Advanced Broad Spectrum' },
      { key: 'format',             value: 'Hybrid Gel-Cream' },
      { key: 'skin_type',          value: 'All Skin Types' },
      { key: 'water_resistant',    value: 'Yes' },
      { key: 'non_comedogenic',    value: 'Yes' },
      { key: 'paraben_free',       value: 'Yes' },
    ],
  },

  // ── HAIR CARE ─────────────────────────────────────────────────────────────
  {
    name: 'Multi-Active Hair Oil',
    slug: 'eminence-hair-oil',
    description:
      'A deeply nourishing multi-oil blend of 14 botanical oils that promotes scalp health, strengthens hair from root to tip, and reduces breakage. Cold-pressed Black Seed Oil and Fenugreek Seed Oil stimulate follicles, while Neem and Onion Oil control scalp inflammation and dandruff.',
    price: 1650,
    sale_price: null,
    sku: 'ELS-HAIR-001',
    stock: 0,
    category: 'hair-care',
    concern_tags: ['hair-fall', 'scalp-health', 'strengthening', 'growth'],
    key_ingredients: [
      'Fenugreek Seed Oil', 'Black Seed Oil', 'Sunflower Oil', 'Coconut Oil',
      'Olive Oil', 'Onion Oil', 'Neem Oil', 'Almond Oil',
      'Coriander Oil', 'Bacopa Oil', 'Emblica Oil', 'Shikakai Oil',
      'Acacia Concinna Extract', 'Sesame Seed Oil',
    ],
    how_to_use:
      'Apply 2–3 ml to scalp and hair. Massage gently for 5 minutes to stimulate circulation. Leave for at least 1 hour (or overnight for deep conditioning), then wash out with a mild shampoo.',
    full_ingredient_list:
      'Fenugreek Seed Oil, Black Seed (Nigella Sativa) Oil, Sunflower Oil, Coconut Oil, Olive Oil, Onion Oil, Neem Oil, Almond Oil, Coriander Oil, Bacopa Oil, Emblica Oil, Shikakai Oil, Acacia Concinna Extract, Sesame Seed Oil, Tocopherol (Vitamin E).',
    image_urls: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    ],
    is_featured: false,
    is_best_seller: false,
    needs_review: true,
    is_active: false, // stock=0, needs_review — hidden until restocked
    attributes: [
      { key: 'format',             value: 'Hair Oil' },
      { key: 'use_area',           value: 'Scalp & Hair' },
      { key: 'key_benefit',        value: 'Anti Hair Fall, Strengthening' },
      { key: 'oil_count',          value: '14 Botanical Oils' },
    ],
  },
  {
    name: 'Anti Hair Fall Shampoo — Biotin & Procapil',
    slug: 'eminence-anti-hairfall-shampoo',
    description:
      'A clinically advanced anti hair-fall shampoo combining Procapil® — a patented complex of Biotinoyl Tripeptide-1, Apigenin, and Oleanolic Acid — with Hydrolyzed Keratin and Pro-Vitamin B5. Visibly reduces hair shedding with regular use while restoring strength and shine to damaged strands.',
    price: 1950,
    sale_price: null,
    sku: 'ELS-HAIR-002',
    stock: 0,
    category: 'hair-care',
    concern_tags: ['hair-fall', 'strengthening', 'scalp-health'],
    key_ingredients: [
      'Biotinoyl Tripeptide-1 (Procapil®)',
      'Apigenin',
      'Oleanolic Acid',
      'Hydrolyzed Keratin',
      'Pro-Vitamin B5 (Panthenol)',
    ],
    how_to_use:
      'Apply to wet hair. Massage into scalp for 2–3 minutes. Leave for 1–2 minutes before rinsing. For best results use at least 3 times per week. Follow with a suitable conditioner.',
    full_ingredient_list:
      'Aqua, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Hydrolyzed Keratin, Panthenol (Pro-Vitamin B5), Apigenin, Oleanolic Acid, Biotinoyl Tripeptide-1, Glycerin, Citric Acid, Sodium Chloride, Phenoxyethanol.',
    image_urls: [
      'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&q=80',
    ],
    is_featured: false,
    is_best_seller: false,
    needs_review: true,
    is_active: false, // needs_review — pricing unconfirmed
    attributes: [
      { key: 'format',             value: 'Shampoo' },
      { key: 'use_area',           value: 'Hair & Scalp' },
      { key: 'key_benefit',        value: 'Anti Hair Fall' },
      { key: 'key_complex',        value: 'Procapil®' },
    ],
  },

  // ── MEDICATED SPECIALTY ───────────────────────────────────────────────────
  {
    name: 'Tar Bar & Shampoo',
    slug: 'eminence-tar-bar-shampoo',
    description:
      'A medicated Coal Tar bar and shampoo dual-format formulation for the treatment of scalp and skin conditions including Dandruff, Seborrhoea, Eczema, and Psoriasis. Coal Tar 1.2% is a time-tested keratolytic and antipruritic active with decades of clinical evidence.',
    price: 850,
    sale_price: null,
    sku: 'ELS-MED-001',
    stock: 50,
    category: 'medicated',
    concern_tags: ['dandruff', 'seborrhoea', 'eczema', 'psoriasis', 'scalp'],
    key_ingredients: ['Coal Tar 1.2%', 'Arachis Oil 0.3%', 'Cade Oil 0.4%'],
    how_to_use:
      'As bar: lather on affected area, leave 3–5 minutes, rinse. As shampoo: apply to wet scalp, massage for 2–3 minutes, leave 5 minutes, rinse thoroughly. Use twice weekly or as directed by physician.',
    full_ingredient_list:
      'Coal Tar 1.2%, Arachis Oil 0.3%, Cade Oil 0.4%, Soap Base (Sodium Palmate, Sodium Palm Kernelate, Aqua, Glycerin, Sodium Chloride).',
    image_urls: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    ],
    is_featured: false,
    is_best_seller: false,
    needs_review: false,
    is_active: true,
    attributes: [
      { key: 'format',             value: 'Bar / Shampoo' },
      { key: 'use_area',           value: 'Scalp & Body' },
      { key: 'key_benefit',        value: 'Dandruff, Seborrhoea, Eczema, Psoriasis' },
      { key: 'coal_tar_pct',       value: '1.2%' },
    ],
  },
  // Mastic-Wash — needs_review, is_active:false (outside core facial skincare scope)
  {
    name: 'Mastic-Wash Feminine Intimate Cleanser',
    slug: 'mastic-wash-feminine-cleanser',
    description:
      'A pH-balanced intimate hygiene wash that maintains the natural pH 4.0 of the vaginal area. Lactic Acid and Tea Tree Oil provide antifungal and antibacterial protection while Triclosan controls harmful bacteria. Reduces irritation, prevents infections, and promotes freshness.',
    price: 1100,
    sale_price: null,
    sku: 'ELS-MED-002',
    stock: 0,
    category: 'medicated',
    concern_tags: ['intimate-hygiene', 'ph-balance', 'antibacterial', 'antifungal'],
    key_ingredients: ['Lactic Acid', 'Triclosan', 'Tea Tree Oil'],
    how_to_use:
      'Apply a small amount to the external intimate area during bathing. Rinse thoroughly. For external use only. Use daily or as needed.',
    full_ingredient_list:
      'Aqua, Lactic Acid, Triclosan, Tea Tree Oil (Melaleuca Alternifolia), Cocamidopropyl Betaine, Sodium Laureth Sulfate, Glycerin, Citric Acid, Phenoxyethanol, Sodium Chloride.',
    image_urls: ['IMG-20260814-WA0028.jpg'],
    is_featured: false,
    is_best_seller: false,
    needs_review: true,
    is_active: false, // Hidden by default — outside main facial skincare scope
    attributes: [
      { key: 'volume_ml',          value: '100' },
      { key: 'ph_value',           value: '4.0' },
      { key: 'format',             value: 'Liquid Wash' },
      { key: 'use_area',           value: 'External Intimate Area' },
      { key: 'manufacturer',       value: 'DM Life Science Lahore' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  UPDATE EXISTING SERUM CATEGORIES — add sort_order + image_url
// ─────────────────────────────────────────────────────────────────────────────
const SERUM_CATEGORY_UPDATES = [
  {
    slug: 'brightening',
    image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=1920&q=90',
    description: 'Vitamin C, Kojic Acid, and AHA actives to fade dark spots and deliver a lit-from-within radiance.',
    sort_order: 1,
  },
  {
    slug: 'anti-aging',
    image_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
    description: 'Retinol, peptide complexes, and bakuchiol to firm, smooth, and restore youthful skin density.',
    sort_order: 2,
  },
  {
    slug: 'hydration',
    image_url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=90',
    description: 'Triple-weight Hyaluronic Acid, polyglutamic acid, and ceramides for sustained, deep hydration.',
    sort_order: 3,
  },
  {
    slug: 'barrier-repair',
    image_url: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80',
    description: 'Centella Asiatica, probiotics, and niacinamide to rebuild and reinforce a compromised skin barrier.',
    sort_order: 4,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  RUNNER
// ─────────────────────────────────────────────────────────────────────────────
async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Running seed 002 — new categories + products...');
    await client.query('BEGIN');

    // ── Update existing serum categories ──────────────────────────────────
    for (const upd of SERUM_CATEGORY_UPDATES) {
      await client.query(
        `UPDATE categories
         SET image_url = $1, description = $2, sort_order = $3
         WHERE slug = $4`,
        [upd.image_url, upd.description, upd.sort_order, upd.slug]
      );
    }
    console.log('  ✅ Existing serum categories updated with image_url + description + sort_order');

    // ── Insert new categories (skip if slug already exists) ───────────────
    const categoryMap = {};

    // First grab existing slugs into map
    const existing = await client.query('SELECT slug, id FROM categories');
    for (const row of existing.rows) categoryMap[row.slug] = row.id;

    for (const cat of NEW_CATEGORIES) {
      const res = await client.query(
        `INSERT INTO categories(name, slug, description, image_url, sort_order)
         VALUES($1,$2,$3,$4,$5)
         ON CONFLICT(slug) DO UPDATE
           SET description = EXCLUDED.description,
               image_url   = EXCLUDED.image_url,
               sort_order  = EXCLUDED.sort_order
         RETURNING id, slug`,
        [cat.name, cat.slug, cat.description, cat.image_url, cat.sort_order]
      );
      categoryMap[res.rows[0].slug] = res.rows[0].id;
    }
    console.log('  ✅ New categories upserted:', NEW_CATEGORIES.map((c) => c.slug).join(', '));

    // ── Insert new products (skip if SKU already exists) ──────────────────
    let seeded = 0;
    let skipped = 0;
    const skippedNames = [];
    const seededPerCategory = {};

    for (const p of NEW_PRODUCTS) {
      // Check if SKU already exists
      const exists = await client.query(
        'SELECT id FROM products WHERE sku = $1',
        [p.sku]
      );
      if (exists.rows.length) {
        skipped++;
        skippedNames.push(p.name);
        continue;
      }

      const catId = categoryMap[p.category];
      if (!catId) {
        console.warn(`  ⚠️  Category '${p.category}' not found for product '${p.name}' — skipping`);
        skipped++;
        continue;
      }

      // Map local image filenames to relative asset paths
      const imageUrls = p.image_urls.map((img) =>
        img.startsWith('http') ? img : `/product-images/${img}`
      );

      const result = await client.query(
        `INSERT INTO products (
           name, slug, description, price, sale_price, sku, stock,
           category_id, concern_tags, key_ingredients, how_to_use,
           full_ingredient_list, image_urls, is_featured, is_best_seller,
           needs_review, is_active
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         RETURNING id`,
        [
          p.name, p.slug, p.description,
          p.price, p.sale_price || null,
          p.sku, p.stock,
          catId,
          p.concern_tags, p.key_ingredients,
          p.how_to_use, p.full_ingredient_list,
          imageUrls,
          p.is_featured, p.is_best_seller,
          p.needs_review, p.is_active,
        ]
      );

      const productId = result.rows[0].id;

      // Insert product_attributes
      for (const attr of (p.attributes || [])) {
        await client.query(
          `INSERT INTO product_attributes(product_id, attr_key, attr_value)
           VALUES($1,$2,$3)
           ON CONFLICT(product_id, attr_key) DO UPDATE SET attr_value = EXCLUDED.attr_value`,
          [productId, attr.key, attr.value]
        );
      }

      seededPerCategory[p.category] = (seededPerCategory[p.category] || 0) + 1;
      seeded++;
    }

    await client.query('COMMIT');

    // ── Summary ───────────────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════');
    console.log('  SEED 002 COMPLETE');
    console.log('══════════════════════════════════════════════');
    console.log(`  ✅ Products seeded: ${seeded}`);
    Object.entries(seededPerCategory).forEach(([cat, count]) => {
      console.log(`     ${cat}: ${count} product(s)`);
    });
    if (skipped > 0) {
      console.log(`  ⏭  Skipped (already exist): ${skipped}`);
      skippedNames.forEach((n) => console.log(`     - ${n}`));
    }
    console.log('\n  ⚠️  Products with needs_review=true (confirm pricing before enabling):');
    NEW_PRODUCTS
      .filter((p) => p.needs_review)
      .forEach((p) => console.log(`     - ${p.name} (SKU: ${p.sku})`));
    console.log('\n  🔒 Products with is_active=false (hidden from shop):');
    NEW_PRODUCTS
      .filter((p) => !p.is_active)
      .forEach((p) => console.log(`     - ${p.name}`));
    console.log('══════════════════════════════════════════════\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed 002 failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
