import type { Request, Response } from 'express';

import { AccountMapper } from '@app/accounts/mappers/AccountMapper';
import type { RegisterAccount } from '@app/accounts/use-cases/RegisterAccount';

export const registerAccountController =
  (useCase: RegisterAccount) => async (req: Request, res: Response) => {
    try {
      const account = await useCase.execute(req.body);
      res.status(201).json(AccountMapper.toResponse(account));
    } catch (err: any) {
      if (err?.message === 'Email already in use') {
        return res.status(409).json({ message: err.message });
      }
      if (err?.message === 'Invalid email') {
        return res.status(400).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
