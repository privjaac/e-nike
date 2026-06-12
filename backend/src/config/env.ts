import 'dotenv/config';

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  port: parseInt(getEnv('PORT'), 10),
  databaseUrl: getEnv('DATABASE_URL'),
  jwtSecret: getEnv('JWT_SECRET'),
  jwtExpiresIn: getEnv('JWT_EXPIRES_IN'),
  corsOrigin: getEnv('CORS_ORIGIN'),
  nodeEnv: getEnv('NODE_ENV'),
};
