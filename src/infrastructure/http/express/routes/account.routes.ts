import { Router } from 'express';

import type { RegisterAccount } from '@app/accounts/use-cases/RegisterAccount';

import { registerAccountController } from '../controllers/RegisterAccountController';

export function accountRouter(deps: { registerAccount: RegisterAccount }) {
  const r = Router();
  r.post('/', registerAccountController(deps.registerAccount));
  return r;
}
