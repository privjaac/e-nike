import { serve } from '@hono/node-server';
import { config } from '@/config/Env';
import { buildContainer } from '@/Container';

const { app } = buildContainer();

serve({
  fetch: app.fetch,
  port: config.port,
});

console.log(`🚀 E-NIKE Backend running at http://localhost:${config.port}`);
