import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('./src/db/e-nike.sqlite');
sqlite.pragma('journal_mode = WAL');
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log('🌱 Seeding database...');

  // Seed categories
  const cats = await db.insert(schema.categories).values([
    { name: 'Running', slug: 'running', type: 'shoes' },
    { name: 'Basketball', slug: 'basketball', type: 'shoes' },
    { name: 'Training', slug: 'training', type: 'shoes' },
    { name: 'Lifestyle', slug: 'lifestyle', type: 'shoes' },
    { name: 'Apparel', slug: 'apparel', type: 'apparel' },
  ]).returning().all();

  // Seed products
  const prods = await db.insert(schema.products).values([
    {
      name: 'Nike Air Max Dn',
      slug: 'nike-air-max-dn',
      description: 'Dynamic Air technology meets bold style.',
      categoryId: cats[3].id,
      sport: 'lifestyle',
      gender: 'men',
      basePrice: 160,
      imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80'],
      isMemberOnly: false,
      isFullPrice: true,
    },
    {
      name: 'Nike Pegasus 41',
      slug: 'nike-pegasus-41',
      description: 'Responsive cushioning for everyday runs.',
      categoryId: cats[0].id,
      sport: 'running',
      gender: 'men',
      basePrice: 130,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
      isMemberOnly: false,
      isFullPrice: true,
    },
    {
      name: 'Nike Dunk Low Retro',
      slug: 'nike-dunk-low-retro',
      description: 'Classic basketball style for the streets.',
      categoryId: cats[3].id,
      sport: 'lifestyle',
      gender: 'men',
      basePrice: 115,
      imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80'],
      isMemberOnly: false,
      isFullPrice: true,
    },
    {
      name: 'Air Zoom Alphafly NEXT% 2',
      slug: 'air-zoom-alphafly-next-2',
      description: 'Engineered for record-breaking speed.',
      categoryId: cats[0].id,
      sport: 'running',
      gender: 'men',
      basePrice: 275,
      imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80'],
      isMemberOnly: true,
      isFullPrice: true,
    },
    {
      name: 'Nike Metcon 9 AMP',
      slug: 'nike-metcon-9-amp',
      description: 'Ultimate stability for weightlifting and training.',
      categoryId: cats[2].id,
      sport: 'training',
      gender: 'men',
      basePrice: 150,
      imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80'],
      isMemberOnly: true,
      isFullPrice: true,
    },
    {
      name: 'Dri-FIT ADV Run Division',
      slug: 'dri-fit-adv-run-division',
      description: 'Lightweight performance tank.',
      categoryId: cats[4].id,
      sport: 'running',
      gender: 'men',
      basePrice: 85,
      imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80'],
      isMemberOnly: false,
      isFullPrice: true,
    },
    {
      name: 'Nike Challenger Shorts',
      slug: 'nike-challenger-shorts',
      description: '5\" brief-lined running shorts.',
      categoryId: cats[4].id,
      sport: 'running',
      gender: 'men',
      basePrice: 40,
      imageUrl: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800&q=80'],
      isMemberOnly: false,
      isFullPrice: true,
    },
    {
      name: 'Nike Air Jordan 1 Mid',
      slug: 'nike-air-jordan-1-mid',
      description: 'Iconic style remastered.',
      categoryId: cats[1].id,
      sport: 'basketball',
      gender: 'men',
      basePrice: 125,
      imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80'],
      isMemberOnly: false,
      isFullPrice: true,
    },
  ]).returning().all();

  // Seed SKUs
  const sizes = ['8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'];
  for (const prod of prods) {
    if (prod.categoryId === cats[4].id) continue; // skip apparel
    for (const size of sizes) {
      await db.insert(schema.skus).values({
        productId: prod.id,
        sku: `${prod.slug.toUpperCase().replace(/-/g, '')}-${size}`,
        size,
        color: 'Black/White',
        colorHex: '#000000',
        stockQuantity: Math.floor(Math.random() * 50) + 5,
      });
    }
  }

  // Seed inventory nodes
  const nodes = await db.insert(schema.inventoryNodes).values([
    { name: 'Nike NYC - 5th Ave', code: 'NYC-001', type: 'store', city: 'New York', country: 'US' },
    { name: 'Los Angeles DC', code: 'LA-DC-01', type: 'warehouse', city: 'Los Angeles', country: 'US' },
    { name: 'Chicago Store', code: 'CHI-001', type: 'store', city: 'Chicago', country: 'US' },
  ]).returning().all();

  // Seed inventory
  const allSkus = await db.select().from(schema.skus).all();
  for (const sku of allSkus) {
    for (const node of nodes) {
      await db.insert(schema.inventory).values({
        skuId: sku.id,
        nodeId: node.id,
        quantity: Math.floor(Math.random() * 20),
        reservedQuantity: Math.floor(Math.random() * 3),
      });
    }
  }

  // Seed users
  const bcrypt = await import('bcryptjs');
  await db.insert(schema.users).values({
    email: 'admin@nike.com',
    passwordHash: await bcrypt.hash('admin123', 10),
    firstName: 'Marcus',
    lastName: 'Jordan',
    role: 'admin',
    membershipTier: 'platinum',
    preferences: { sports: ['running', 'basketball'], sizes: { shoes: '10.5', apparel: 'M' } },
  });

  await db.insert(schema.users).values({
    email: 'member@nike.com',
    passwordHash: await bcrypt.hash('member123', 10),
    firstName: 'Alex',
    lastName: 'Runner',
    role: 'customer',
    membershipTier: 'gold',
    preferences: { sports: ['running'], sizes: { shoes: '10', apparel: 'M' } },
  });

  // Seed promotions
  await db.insert(schema.promotions).values({
    name: 'End of Season',
    code: 'EOS20',
    type: 'percentage',
    value: 20,
    isAutoMarkdown: false,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    isActive: true,
    createdBy: 1,
  });

  console.log('✅ Seed completed successfully');
  sqlite.close();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
