import { Hono } from 'hono';
import { CatalogController } from '../controllers/catalog.controller';

const catalog = new Hono();
const controller = new CatalogController();

catalog.get('/products', (c) => controller.getProducts(c));
catalog.get('/products/:slug', (c) => controller.getProductBySlug(c));
catalog.get('/categories', (c) => controller.getCategories(c));

export { catalog as catalogRoutes };
