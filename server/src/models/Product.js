const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: { type: String, default: '' },
    brand: { type: String, default: '' },
    fabric: { type: String, default: '' },
    colors: [{ type: String }],
    sizes: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    description: { type: String, default: '' },
    tags: [{ type: String }],
    images: [{ type: String }],
    videoUrl: { type: String, default: '' },
    stockQty: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
    isFeatured: { type: Boolean, default: false },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.virtual('salePrice').get(function getSalePrice() {
  if (!this.discountPercent) return this.price;
  return Math.round((this.price - (this.price * this.discountPercent) / 100) * 100) / 100;
});

productSchema.virtual('stockStatus').get(function getStockStatus() {
  if (this.stockQty <= 0) return 'out_of_stock';
  if (this.stockQty <= this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
