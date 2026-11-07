import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './api/routes';
import { authenticateSession } from './services/auth';

dotenv.config();

export interface ServerConfig {
  port: number;
  environment: string;
}

export function createServer() {
  const app = express();

  // Security Headers
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Middleware with CORS credential support
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Session Authentication Middleware
  app.use(authenticateSession);

  // API Routes
  app.use('/api', apiRouter);

  // Centralized Error Handling
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Novus Server Error]:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}

export const initServer = (config: ServerConfig = { port: Number(process.env.PORT) || 4000, environment: process.env.NODE_ENV || 'development' }) => {
  const app = createServer();
  const server = app.listen(config.port, () => {
    console.log(`[Novus Backend] Server running on http://localhost:${config.port} (${config.environment})`);
  });
  return { app, server, config };
};

if (process.env.NODE_ENV !== 'test') {
  initServer();
}
