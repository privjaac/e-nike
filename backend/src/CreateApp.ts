import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { config } from '@/config/Env';
import { errorHandler } from '@/middleware/ErrorHandler';
import { createAuthRoutes } from '@/routes/AuthRoutes';
import { createCatalogRoutes } from '@/routes/CatalogRoutes';
import { createInventoryRoutes } from '@/routes/InventoryRoutes';
import { createCartRoutes } from '@/routes/CartRoutes';
import { createOrderRoutes } from '@/routes/OrderRoutes';
import { createPromotionRoutes } from '@/routes/PromotionRoutes';
import { createDashboardRoutes } from '@/routes/DashboardRoutes';
import { createUserRoutes } from '@/routes/UserRoutes';
import { createFavoritesRoutes } from '@/routes/FavoritesRoutes';
import type { AuthController } from '@/controllers/AuthController';
import type { CartController } from '@/controllers/CartController';
import type { CatalogController } from '@/controllers/CatalogController';
import type { InventoryController } from '@/controllers/InventoryController';
import type { OrderController } from '@/controllers/OrderController';
import type { PromotionController } from '@/controllers/PromotionController';
import type { DashboardController } from '@/controllers/DashboardController';
import type { UserController } from '@/controllers/UserController';
import type { FavoriteController } from '@/controllers/FavoriteController';

interface Controllers {
  authController: AuthController;
  cartController: CartController;
  catalogController: CatalogController;
  inventoryController: InventoryController;
  orderController: OrderController;
  promotionController: PromotionController;
  dashboardController: DashboardController;
  userController: UserController;
  favoriteController: FavoriteController;
}

export function createApp(controllers: Controllers) {
  const app = new Hono();

  app.use('*', cors({ origin: config.corsOrigin, credentials: true }));
  app.use('*', logger());
  app.use('*', prettyJSON());

  app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

  app.route('/api/v1/auth', createAuthRoutes(controllers.authController));
  app.route('/api/v1/catalog', createCatalogRoutes(controllers.catalogController));
  app.route('/api/v1/inventory', createInventoryRoutes(controllers.inventoryController));
  app.route('/api/v1/cart', createCartRoutes(controllers.cartController));
  app.route('/api/v1/orders', createOrderRoutes(controllers.orderController));
  app.route('/api/v1/promotions', createPromotionRoutes(controllers.promotionController));
  app.route('/api/v1/dashboard', createDashboardRoutes(controllers.dashboardController));
  app.route('/api/v1/users', createUserRoutes(controllers.userController));
  app.route('/api/v1/favorites', createFavoritesRoutes(controllers.favoriteController));

  app.onError(errorHandler);

  return app;
}
