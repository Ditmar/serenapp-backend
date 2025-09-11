import { env } from '@infra/config/env';
import { logger } from '@infra/observability/logger';

import { buildApp } from './app';

export function startHttp() {
  const app = buildApp();
  app.listen(env.PORT, () => {
    logger.info(`HTTP listening on http://localhost:${env.PORT}`);
  });
}
