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
import type { IAuthController } from '@/controllers/IAuthController';
import type { ICartController } from '@/controllers/ICartController';
import type { ICatalogController } from '@/controllers/ICatalogController';
import type { IInventoryController } from '@/controllers/IInventoryController';
import type { IOrderController } from '@/controllers/IOrderController';
import type { IPromotionController } from '@/controllers/IPromotionController';
import type { IDashboardController } from '@/controllers/IDashboardController';
import type { IUserController } from '@/controllers/IUserController';
import type { IFavoriteController } from '@/controllers/IFavoriteController';

interface Controllers {
  authController: IAuthController;
  cartController: ICartController;
  catalogController: ICatalogController;
  inventoryController: IInventoryController;
  orderController: IOrderController;
  promotionController: IPromotionController;
  dashboardController: IDashboardController;
  userController: IUserController;
  favoriteController: IFavoriteController;
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
