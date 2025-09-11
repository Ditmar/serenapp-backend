import express from 'express';

import { RegisterAccount } from '@app/accounts/use-cases/RegisterAccount';

import { accountRouter } from '@infra/http/express/routes/account.routes';
import { PrismaAccountRepository } from '@infra/persistence/repositories/PrismaAccountRepository';

export function buildApp() {
  const app = express();
  app.use(express.json());

  const accountRepo = new PrismaAccountRepository();
  const registerAccount = new RegisterAccount(accountRepo);

  app.use('/accounts', accountRouter({ registerAccount }));

  app.get('/health', (_req, res) => res.json({ ok: true }));

  return app;
}
