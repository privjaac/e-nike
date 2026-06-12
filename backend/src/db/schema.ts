import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: text('role', { enum: ['customer', 'admin', 'merchandiser'] }).notNull().default('customer'),
  membershipTier: text('membership_tier', { enum: ['member', 'silver', 'gold', 'platinum'] }).notNull().default('member'),
  preferences: text('preferences', { mode: 'json' }).$type<{
    sports?: string[];
    sizes?: { shoes?: string; apparel?: string };
  }>(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const categories = sqliteTable('categories', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  type: text('type', { enum: ['shoes', 'apparel', 'accessories'] }).notNull(),
  parentId: integer('parent_id', { mode: 'number' }),
});

export const products = sqliteTable('products', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  categoryId: integer('category_id', { mode: 'number' }).notNull(),
  sport: text('sport', { enum: ['running', 'basketball', 'training', 'lifestyle', 'football'] }).notNull(),
  gender: text('gender', { enum: ['men', 'women', 'kids', 'unisex'] }).notNull(),
  basePrice: real('base_price').notNull(),
  salePrice: real('sale_price'),
  imageUrl: text('image_url').notNull(),
  gallery: text('gallery', { mode: 'json' }).$type<string[]>(),
  isMemberOnly: integer('is_member_only', { mode: 'boolean' }).notNull().default(false),
  isFullPrice: integer('is_full_price', { mode: 'boolean' }).notNull().default(true),
  status: text('status', { enum: ['active', 'inactive', 'discontinued'] }).notNull().default('active'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const skus = sqliteTable('skus', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  productId: integer('product_id', { mode: 'number' }).notNull(),
  sku: text('sku').notNull().unique(),
  size: text('size').notNull(),
  color: text('color').notNull(),
  colorHex: text('color_hex'),
  stockQuantity: integer('stock_quantity', { mode: 'number' }).notNull().default(0),
  weightGrams: integer('weight_grams', { mode: 'number' }),
});

export const inventoryNodes = sqliteTable('inventory_nodes', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  type: text('type', { enum: ['warehouse', 'store', 'partner'] }).notNull(),
  city: text('city').notNull(),
  country: text('country').notNull(),
});

export const inventory = sqliteTable('inventory', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  skuId: integer('sku_id', { mode: 'number' }).notNull(),
  nodeId: integer('node_id', { mode: 'number' }).notNull(),
  quantity: integer('quantity', { mode: 'number' }).notNull().default(0),
  reservedQuantity: integer('reserved_quantity', { mode: 'number' }).notNull().default(0),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const carts = sqliteTable('carts', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer('user_id', { mode: 'number' }),
  sessionId: text('session_id'),
  status: text('status', { enum: ['active', 'converted', 'abandoned'] }).notNull().default('active'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_carts_session').on(table.sessionId),
]);

export const cartItems = sqliteTable('cart_items', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  cartId: integer('cart_id', { mode: 'number' }).notNull(),
  skuId: integer('sku_id', { mode: 'number' }).notNull(),
  quantity: integer('quantity', { mode: 'number' }).notNull().default(1),
  unitPrice: real('unit_price').notNull(),
  addedAt: text('added_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orders = sqliteTable('orders', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer('user_id', { mode: 'number' }).notNull(),
  orderNumber: text('order_number').notNull().unique(),
  status: text('status', { enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'] }).notNull().default('pending'),
  totalAmount: real('total_amount').notNull(),
  shippingAddress: text('shipping_address', { mode: 'json' }).$type<{
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }>(),
  fulfillmentNodeId: integer('fulfillment_node_id', { mode: 'number' }),
  estimatedDelivery: text('estimated_delivery'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const favorites = sqliteTable('favorites', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer('user_id', { mode: 'number' }).notNull(),
  productId: integer('product_id', { mode: 'number' }).notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const promotions = sqliteTable('promotions', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  type: text('type', { enum: ['percentage', 'fixed', 'bundle'] }).notNull(),
  value: real('value').notNull(),
  isAutoMarkdown: integer('is_auto_markdown', { mode: 'boolean' }).notNull().default(false),
  minWos: real('min_wos'),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdBy: integer('created_by', { mode: 'number' }).notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type ProductInsert = typeof products.$inferInsert;
export type ProductUpdate = Partial<typeof products.$inferInsert>;
export type SkuInsert = typeof skus.$inferInsert;
export type SkuUpdate = Partial<typeof skus.$inferInsert>;
export type PromotionInsert = typeof promotions.$inferInsert;
export type PromotionUpdate = Partial<typeof promotions.$inferInsert>;
export type OrderInsert = typeof orders.$inferInsert;
export type OrderUpdate = Partial<typeof orders.$inferInsert>;
export type UserInsert = typeof users.$inferInsert;
export type UserUpdate = Partial<typeof users.$inferInsert>;
