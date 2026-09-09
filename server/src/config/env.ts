import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  agentRouterApiKey: process.env.AGENTROUTER_API_KEY || process.env.OPENAI_API_KEY || '',
  agentRouterModel: process.env.AGENTROUTER_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini',
};
