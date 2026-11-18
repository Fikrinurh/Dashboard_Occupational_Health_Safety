
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  initializeDatabaseAdapter,
  getSystemStatus,
} from '../../server/db/adapter.js';

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse
) {
  try {
    await initializeDatabaseAdapter();

    return res.status(200).json({
      ok: true,
      status: getSystemStatus(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[OHS SYSTEM STATUS]', error);

    return res.status(500).json({
      ok: false,
      error: 'System status check failed',
    });
  }
}
