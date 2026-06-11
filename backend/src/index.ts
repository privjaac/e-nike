import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { config } from './config/env';
import { errorHandler } from './middleware/error-handler';
import { authRoutes } from './routes/auth.routes';
import { catalogRoutes } from './routes/catalog.routes';
import { inventoryRoutes } from './routes/inventory.routes';
import { cartRoutes } from './routes/cart.routes';
import { orderRoutes } from './routes/order.routes';
import { promotionRoutes } from './routes/promotion.routes';
import { dashboardRoutes } from './routes/dashboard.routes';
import { userRoutes } from './routes/user.routes';
import { favoritesRoutes } from './routes/favorites.routes';

const app = new Hono();

// Global middleware
app.use('*', cors({ origin: config.corsOrigin, credentials: true }));
app.use('*', logger());
app.use('*', prettyJSON());

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API Routes
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/catalog', catalogRoutes);
app.route('/api/v1/inventory', inventoryRoutes);
app.route('/api/v1/cart', cartRoutes);
app.route('/api/v1/orders', orderRoutes);
app.route('/api/v1/promotions', promotionRoutes);
app.route('/api/v1/dashboard', dashboardRoutes);
app.route('/api/v1/users', userRoutes);
app.route('/api/v1/favorites', favoritesRoutes);

// Error handler
app.onError(errorHandler);

serve({
  fetch: app.fetch,
  port: config.port,
});

console.log(`🚀 E-NIKE Backend running at http://localhost:${config.port}`);
