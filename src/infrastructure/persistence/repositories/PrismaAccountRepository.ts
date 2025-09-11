import { Account } from '@domain/accounts/entities/Account';
import type { AccountRepository } from '@domain/accounts/ports/AccountRepository';

import { prisma } from '@infra/persistence/client';

export class PrismaAccountRepository implements AccountRepository {
  async findByEmail(email: string): Promise<Account | null> {
    const row = await prisma.account.findUnique({ where: { email } });
    return row ? Account.fromPersistence(row) : null;
  }

  async save(account: Account): Promise<void> {
    const data = account.toPersistence();
    await prisma.account.upsert({
      where: { id: data.id },
      create: data,
      update: data
    });
  }
}
