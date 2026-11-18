
import type { SystemStatus } from '../../src/shared/types';
import { DemoStoreRepository } from './demoStore.js';
import { isMysqlConfigured, testMysqlConnection } from './mysql.js';
import { MysqlRepository } from './mysqlRepository.js';
import type { OhsRepository } from './types';

let activeRepo: OhsRepository | null = null;

let systemStatus: SystemStatus = {
  mode: 'DEMO_STORE',
  mysqlConfigured: false,
  mysqlConnected: false,
  message: 'Initializing database adapter...',
};

export async function initializeDatabaseAdapter(): Promise<OhsRepository> {
  const isProduction = process.env.NODE_ENV === 'production';
  const configured = isMysqlConfigured();

  if (!configured) {
    if (isProduction) {
      throw new Error(
        'MySQL configuration is incomplete. Check DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME.'
      );
    }

    activeRepo = new DemoStoreRepository();

    systemStatus = {
      mode: 'DEMO_STORE',
      mysqlConfigured: false,
      mysqlConnected: false,
      message: 'Using local Demo Store.',
    };

    return activeRepo;
  }

  const check = await testMysqlConnection();

  if (!check.ok) {
    systemStatus = {
      mode: 'DEMO_STORE',
      mysqlConfigured: true,
      mysqlConnected: false,
      message: `MySQL connection failed: ${check.error}`,
    };

    if (isProduction) {
      throw new Error(
        `Production database connection failed: ${check.error}`
      );
    }

    activeRepo = new DemoStoreRepository();
    return activeRepo;
  }

  activeRepo = new MysqlRepository();

  systemStatus = {
    mode: 'MYSQL',
    mysqlConfigured: true,
    mysqlConnected: true,
    message: 'Connected to MySQL database pool.',
  };

  return activeRepo;
}

export function getRepository(): OhsRepository {
  if (!activeRepo) {
    throw new Error(
      'Database repository has not been initialized.'
    );
  }

  return activeRepo;
}

export function getSystemStatus(): SystemStatus {
  return systemStatus;
}
