import type { Account } from '../entities/Account';

export interface AccountRepository {
  findByEmail(email: string): Promise<Account | null>;
  save(account: Account): Promise<void>;
}
