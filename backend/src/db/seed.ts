import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '@/db/Schema';

const sqlite = new Database('./src/db/e-nike.sqlite');
sqlite.pragma('journal_mode = WAL');
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log('🌱 Seeding database...');

  const existingCats = await db.select().from(schema.categories).all();
  let cats = existingCats;
  if (existingCats.length === 0) {
    cats = await db.insert(schema.categories).values([
      { name: 'Running', slug: 'running', type: 'shoes' },
      { name: 'Basketball', slug: 'basketball', type: 'shoes' },
      { name: 'Training', slug: 'training', type: 'shoes' },
      { name: 'Lifestyle', slug: 'lifestyle', type: 'shoes' },
      { name: 'Apparel', slug: 'apparel', type: 'apparel' },
    ]).returning().all();
  }

  const catMap = new Map(cats.map((c) => [c.slug, c.id]));
  const getCatId = (slug: string) => catMap.get(slug) ?? cats[0].id;

  const existingProds = await db.select().from(schema.products).all();
  let prods = existingProds;
  if (existingProds.length === 0) {
    prods = await db.insert(schema.products).values([
      // Men
      {
        name: 'Nike Air Max Dn',
        slug: 'nike-air-max-dn',
        description: 'Dynamic Air technology meets bold style.',
        categoryId: getCatId('lifestyle'),
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
        categoryId: getCatId('running'),
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
        categoryId: getCatId('lifestyle'),
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
        categoryId: getCatId('running'),
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
        categoryId: getCatId('training'),
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
        categoryId: getCatId('apparel'),
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
        description: '5" brief-lined running shorts.',
        categoryId: getCatId('apparel'),
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
        categoryId: getCatId('basketball'),
        sport: 'basketball',
        gender: 'men',
        basePrice: 125,
        imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80',
        gallery: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80'],
        isMemberOnly: false,
        isFullPrice: true,
      },
      // Women
      {
        name: 'Nike Air Max 90',
        slug: 'nike-air-max-90-women',
        description: 'Timeless design with modern comfort for her.',
        categoryId: getCatId('lifestyle'),
        sport: 'lifestyle',
        gender: 'women',
        basePrice: 140,
        imageUrl: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&q=80',
        gallery: ['https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&q=80'],
        isMemberOnly: false,
        isFullPrice: true,
      },
      {
        name: 'Nike Invincible 3',
        slug: 'nike-invincible-3',
        description: 'Maximum cushioning for her daily miles.',
        categoryId: getCatId('running'),
        sport: 'running',
        gender: 'women',
        basePrice: 180,
        imageUrl: 'https://images.unsplash.com/photo-1560769629-975e13f0c470?w=800&q=80',
        gallery: ['https://images.unsplash.com/photo-1560769629-975e13f0c470?w=800&q=80'],
        isMemberOnly: false,
        isFullPrice: true,
      },
      {
        name: 'Nike Zoom Bella 6',
        slug: 'nike-zoom-bella-6',
        description: 'Versatile training shoe built for her workouts.',
        categoryId: getCatId('training'),
        sport: 'training',
        gender: 'women',
        basePrice: 110,
        imageUrl: 'https://images.unsplash.com/photo-1579338559194-a162d19c1437?w=800&q=80',
        gallery: ['https://images.unsplash.com/photo-1579338559194-a162d19c1437?w=800&q=80'],
        isMemberOnly: false,
        isFullPrice: true,
      },
      {
        name: 'Nike Pro Dri-FIT Tank',
        slug: 'nike-pro-dri-fit-tank',
        description: 'Sweat-wicking support for every rep.',
        categoryId: getCatId('apparel'),
        sport: 'training',
        gender: 'women',
        basePrice: 35,
        imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
        gallery: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80'],
        isMemberOnly: false,
        isFullPrice: true,
      },
      // Kids
      {
        name: 'Nike Star Runner 4',
        slug: 'nike-star-runner-4',
        description: 'Light and flexible for all-day play.',
        categoryId: getCatId('running'),
        sport: 'running',
        gender: 'kids',
        basePrice: 65,
        imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80',
        gallery: ['https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80'],
        isMemberOnly: false,
        isFullPrice: true,
      },
      {
        name: 'Nike Court Borough Low 2',
        slug: 'nike-court-borough-low-2',
        description: 'Classic court style in kid sizes.',
        categoryId: getCatId('basketball'),
        sport: 'basketball',
        gender: 'kids',
        basePrice: 55,
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
        gallery: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80'],
        isMemberOnly: false,
        isFullPrice: true,
      },
      // Sale items
      {
        name: 'Nike Revolution 6',
        slug: 'nike-revolution-6',
        description: 'Lightweight runner now on sale.',
        categoryId: getCatId('running'),
        sport: 'running',
        gender: 'men',
        basePrice: 70,
        salePrice: 49.99,
        imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
        gallery: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80'],
        isMemberOnly: false,
        isFullPrice: false,
      },
      {
        name: 'Nike Flex Experience Run 11',
        slug: 'nike-flex-experience-run-11',
        description: 'Flexible and breathable at a great price.',
        categoryId: getCatId('running'),
        sport: 'running',
        gender: 'women',
        basePrice: 75,
        salePrice: 54.99,
        imageUrl: 'https://images.unsplash.com/photo-1560769629-975e13f0c470?w=800&q=80',
        gallery: ['https://images.unsplash.com/photo-1560769629-975e13f0c470?w=800&q=80'],
        isMemberOnly: false,
        isFullPrice: false,
      },
    ]).returning().all();
  } else {
    console.log('⏭️ Products already seeded, skipping...');
  }

  const sizes = ['8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'];
  const existingSkus = await db.select().from(schema.skus).all();
  if (existingSkus.length === 0) {
    for (const prod of prods) {
      if (prod.categoryId === getCatId('apparel')) continue;
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
  }

  const existingNodes = await db.select().from(schema.inventoryNodes).all();
  let nodes = existingNodes;
  if (existingNodes.length === 0) {
    nodes = await db.insert(schema.inventoryNodes).values([
      { name: 'Nike NYC - 5th Ave', code: 'NYC-001', type: 'store', city: 'New York', country: 'US' },
      { name: 'Los Angeles DC', code: 'LA-DC-01', type: 'warehouse', city: 'Los Angeles', country: 'US' },
      { name: 'Chicago Store', code: 'CHI-001', type: 'store', city: 'Chicago', country: 'US' },
    ]).returning().all();
  }

  const allSkus = await db.select().from(schema.skus).all();
  const existingInventory = await db.select().from(schema.inventory).all();
  if (existingInventory.length === 0) {
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
  }

  const existingUsers = await db.select().from(schema.users).all();
  if (existingUsers.length === 0) {
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
  }

  const existingPromos = await db.select().from(schema.promotions).all();
  if (existingPromos.length === 0) {
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
  }

  console.log('✅ Seed completed successfully');
  sqlite.close();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
