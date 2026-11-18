import express from 'express';
import { initializeDatabaseAdapter } from '../server/db/adapter.js';
import { apiRouter } from '../server/routes/api.js';

const app = express.default ? express.default() : express();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

let databaseInitialization: ReturnType<typeof initializeDatabaseAdapter> | null = null;

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

app.use('/api', apiRouter);

export default app;
