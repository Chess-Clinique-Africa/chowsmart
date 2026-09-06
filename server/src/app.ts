import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { AppError, errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: env.isProd ? 300 : 1000,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
  app.use(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pinoHttp as any)({
      autoLogging: env.nodeEnv !== 'test',
      quietReqLogger: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', routes);

  app.use((_req, _res, next) => {
    next(new AppError('Not found', 404, 'NOT_FOUND'));
  });

  app.use(errorHandler);

  return app;
}

export const app = createApp();
