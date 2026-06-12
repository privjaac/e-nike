import { ErrorHandler } from 'hono';
import { config } from '@/config/Env';

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(err);
  const status = err instanceof Error && 'status' in err ? (err as any).status : 500;
  return c.json(
    {
      success: false,
      error: err.message || 'Internal Server Error',
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    },
    status as any
  );
};
