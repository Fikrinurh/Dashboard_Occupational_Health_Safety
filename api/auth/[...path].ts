import express from 'express';
import { initializeDatabaseAdapter } from '../../server/db/adapter.js';
import { apiRouter } from '../../server/routes/api.js';

const app = express();

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
    console.error('[OHS AUTH API] Database initialization failed:', error);
    next(error);
  }
});

app.use('/api', apiRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[OHS AUTH API] Error:', error);
  res.status(500).json({
    ok: false,
    error: 'Internal server error',
  });
});

export default app;
