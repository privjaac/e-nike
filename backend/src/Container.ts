import { config } from '@/config/Env';
import { TokenService } from '@/services/token/TokenService';
import { AuthService } from '@/services/auth/AuthService';
import { CartService } from '@/services/cart/CartService';
import { CatalogService } from '@/services/catalog/CatalogService';
import { InventoryService } from '@/services/inventory/InventoryService';
import { OrderService } from '@/services/order/OrderService';
import { PromotionService } from '@/services/promotion/PromotionService';
import { DashboardService } from '@/services/dashboard/DashboardService';
import { UserService } from '@/services/user/UserService';
import { FavoriteService } from '@/services/favorite/FavoriteService';
import { UserRepository } from '@/repositories/user/UserRepository';
import { CartRepository } from '@/repositories/cart/CartRepository';
import { CatalogRepository } from '@/repositories/catalog/CatalogRepository';
import { InventoryRepository } from '@/repositories/inventory/InventoryRepository';
import { OrderRepository } from '@/repositories/order/OrderRepository';
import { PromotionRepository } from '@/repositories/promotion/PromotionRepository';
import { FavoriteRepository } from '@/repositories/favorite/FavoriteRepository';
import { DashboardRepository } from '@/repositories/dashboard/DashboardRepository';
import { AuthController } from '@/controllers/AuthController';
import { CartController } from '@/controllers/CartController';
import { CatalogController } from '@/controllers/CatalogController';
import { InventoryController } from '@/controllers/InventoryController';
import { OrderController } from '@/controllers/OrderController';
import { PromotionController } from '@/controllers/PromotionController';
import { DashboardController } from '@/controllers/DashboardController';
import { UserController } from '@/controllers/UserController';
import { FavoriteController } from '@/controllers/FavoriteController';
import { createApp } from '@/CreateApp';

export function buildContainer() {
  const tokenService = new TokenService(config.jwtSecret, config.jwtExpiresIn);

  const userRepository = new UserRepository();
  const cartRepository = new CartRepository();
  const catalogRepository = new CatalogRepository();
  const inventoryRepository = new InventoryRepository();
  const orderRepository = new OrderRepository();
  const promotionRepository = new PromotionRepository();
  const favoriteRepository = new FavoriteRepository();
  const dashboardRepository = new DashboardRepository();

  const cartService = new CartService(cartRepository);
  const authService = new AuthService(userRepository, tokenService, cartService);
  const catalogService = new CatalogService(catalogRepository);
  const inventoryService = new InventoryService(inventoryRepository);
  const orderService = new OrderService(orderRepository, cartRepository);
  const promotionService = new PromotionService(promotionRepository);
  const dashboardService = new DashboardService(dashboardRepository, promotionRepository);
  const userService = new UserService(userRepository);
  const favoriteService = new FavoriteService(favoriteRepository);

  const authController = new AuthController(authService);
  const cartController = new CartController(cartService);
  const catalogController = new CatalogController(catalogService);
  const inventoryController = new InventoryController(inventoryService);
  const orderController = new OrderController(orderService);
  const promotionController = new PromotionController(promotionService);
  const dashboardController = new DashboardController(dashboardService);
  const userController = new UserController(userService);
  const favoriteController = new FavoriteController(favoriteService);

  const app = createApp({
    authController,
    cartController,
    catalogController,
    inventoryController,
    orderController,
    promotionController,
    dashboardController,
    userController,
    favoriteController,
  });

  return { app };
}
