import type { Account } from '@domain/accounts/entities/Account';

export class AccountMapper {
  static toResponse(acc: Account) {
    return {
      id: acc.id,
      name: acc.name,
      email: acc.email.value
    };
  }
}
