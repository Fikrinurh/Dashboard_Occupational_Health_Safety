
import express from 'express';
import { initializeDatabaseAdapter } from '../server/db/adapter.js';
import { apiRouter } from '../server/routes/api.js';

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize database once per serverless instance
let databaseInitialization: Promise<void> | null = null;

app.use(async (_req, _res, next) => {
  try {
    if (!databaseInitialization) {
      databaseInitialization = initializeDatabaseAdapter();
    }

    await databaseInitialization;
    next();
  } catch (error) {
    console.error('[OHS EXPERT] Database initialization failed:', error);
    next(error);
  }
});

// Keep the same API prefix used by the local server
app.use('/api', apiRouter);

export default app;
