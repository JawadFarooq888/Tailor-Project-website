require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const slugify = require('./slugify');

const categoriesData = [
  { name: 'Men Formal Suits', description: 'Tailored formal suits for men' },
  { name: 'Men Shirts', description: 'Casual and formal shirts' },
  { name: 'Women Traditional Wear', description: 'Stitched and unstitched traditional outfits' },
  { name: 'Kids Wear', description: 'Clothing for children' },
];

// One representative photo per category (index-aligned with categoriesData), used to seed
// demo products. Swap these for real product photography via the admin panel's image upload.
const CATEGORY_IMAGES = [
  ['https://upload.wikimedia.org/wikipedia/commons/7/7a/Suit.jpg'],
  ['https://upload.wikimedia.org/wikipedia/commons/9/9e/Dress_shirt_MET_2011.46_B.jpg'],
  ['https://upload.wikimedia.org/wikipedia/commons/d/dc/Balochi_Shalwar_Kameez.jpg'],
  ["https://upload.wikimedia.org/wikipedia/commons/7/79/Children's_Clothing_(5795702508).jpg"],
];

// 8 distinct product names per category (index-aligned with categoriesData).
const CATEGORY_PRODUCT_NAMES = [
  [
    'Charcoal Three-Piece Suit',
    'Navy Slim-Fit Suit',
    'Classic Black Tuxedo',
    'Grey Pinstripe Business Suit',
    'Double-Breasted Formal Suit',
    'Beige Linen Summer Suit',
    'Maroon Wedding Sherwani Suit',
    'Checked Tweed Blazer Suit',
  ],
  [
    'Classic Oxford Shirt',
    'Slim-Fit Dress Shirt',
    'Linen Casual Shirt',
    'Striped Formal Shirt',
    'White Cutaway Collar Shirt',
    'Denim Casual Shirt',
    'Checked Flannel Shirt',
    'Mandarin Collar Shirt',
  ],
  [
    'Embroidered Shalwar Kameez',
    'Printed Lawn 3-Piece Suit',
    'Silk Kurta Set',
    'Chiffon Party Wear Suit',
    'Zari Work Bridal Outfit',
    'Cotton Straight Kurti',
    'Organza Festive Dress',
    'Handloom Cotton Suit',
  ],
  [
    "Boys' Formal Waistcoat Set",
    "Girls' Party Frock",
    'Kids Casual T-Shirt Set',
    "Children's Winter Jacket",
    "Boys' Kurta Pajama",
    "Girls' Embroidered Frock",
    'Kids Denim Dungaree',
    'Toddler Cotton Romper',
  ],
];

// Generous stock levels by default ("lots of stock"), with a handful of products
// deliberately seeded low/out-of-stock so the admin low-stock alerts have something to show.
function stockForIndex(i) {
  if (i % 11 === 0) return 0; // out of stock
  if (i % 7 === 0) return 2 + (i % 4); // low stock (2-5)
  return 80 + ((i * 17) % 220); // healthy stock: 80-299
}

function productSeed(categoryId, categoryIndex, nameIndex, i) {
  const name = CATEGORY_PRODUCT_NAMES[categoryIndex][nameIndex];
  return {
    name,
    sku: `SKU-${1000 + i}`,
    category: categoryId,
    brand: 'Tailor Boutique',
    fabric: ['Cotton', 'Linen', 'Wool Blend', 'Silk'][i % 4],
    colors: ['Charcoal', 'Ivory', 'Burgundy', 'Navy'].slice(0, (i % 4) + 1),
    sizes: ['S', 'M', 'L', 'XL'].slice(0, (i % 4) + 1),
    price: 3000 + i * 250,
    discountPercent: i % 3 === 0 ? 15 : 0,
    description: 'Premium bespoke-inspired piece crafted with attention to detail and finished by hand.',
    tags: ['bestseller', 'new'].slice(0, i % 2 === 0 ? 2 : 1),
    images: CATEGORY_IMAGES[categoryIndex],
    stockQty: stockForIndex(i),
    lowStockThreshold: 8,
    status: 'active',
    isFeatured: i % 3 === 0,
  };
}

async function seed() {
  await connectDB();

  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({})]);

  const admin = await User.create({
    name: 'Boutique Admin',
    email: 'admin',
    password: 'admin123',
    role: 'admin',
  });

  const categories = await Category.insertMany(
    categoriesData.map((c) => ({ ...c, slug: slugify(c.name) }))
  );

  const products = [];
  let i = 1;
  categories.forEach((category, categoryIndex) => {
    CATEGORY_PRODUCT_NAMES[categoryIndex].forEach((_, nameIndex) => {
      const data = productSeed(category._id, categoryIndex, nameIndex, i);
      products.push({ ...data, slug: `${slugify(data.name)}-${i}` });
      i += 1;
    });
  });
  await Product.insertMany(products);

  const totalUnits = products.reduce((sum, p) => sum + p.stockQty, 0);
  const outOfStock = products.filter((p) => p.stockQty === 0).length;
  const lowStock = products.filter((p) => p.stockQty > 0 && p.stockQty <= p.lowStockThreshold).length;

  console.log('Seed complete.');
  console.log(`Admin login: ${admin.email} / admin123`);
  console.log(`Categories: ${categories.length}, Products: ${products.length}, Total units in stock: ${totalUnits}`);
  console.log(`(${outOfStock} out of stock, ${lowStock} low stock — for demoing inventory alerts)`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
