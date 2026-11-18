
import express from 'express';
import { initializeDatabaseAdapter } from '../server/db/adapter.js';
import { apiRouter } from '../server/routes/api.js';

const app = express();

app.use((req, _res, next) => {
  console.log('[VERCEL CATCH-ALL]', req.method, req.url);
  next();
});

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

let databaseInitialization:
  | ReturnType<typeof initializeDatabaseAdapter>
  | null = null;

app.use(async (_req, _res, next) => {
  try {
    if (!databaseInitialization) {
      databaseInitialization = initializeDatabaseAdapter().catch((error) => {
        databaseInitialization = null;
        throw error;
      });
    }

    await databaseInitialization;
    next();
  } catch (error) {
    console.error('[OHS EXPERT] Database initialization failed:', error);
    next(error);
  }
});

// API routes
app.use('/api', apiRouter);

// Handle unknown API routes
app.use('/api', (_req, res) => {
  res.status(404).json({
    ok: false,
    error: 'API endpoint not found',
  });
});

// Handle unexpected errors
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[OHS EXPERT] API error:', error);

  res.status(500).json({
    ok: false,
    error: 'Internal server error',
  });
});

export default app;
