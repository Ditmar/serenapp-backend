import { Account } from '@domain/accounts/entities/Account';
import { EmailAlreadyInUse } from '@domain/accounts/errors/AccountErrors';
import type { AccountRepository } from '@domain/accounts/ports/AccountRepository';
import { Email } from '@domain/accounts/value-objects/Email';

import type { RegisterAccountDTO } from '../dto/RegisterAccountDTO';

export class RegisterAccount {
  constructor(private readonly repo: AccountRepository) {}

  async execute(input: RegisterAccountDTO) {
    const email = Email.create(input.email);
    const existing = await this.repo.findByEmail(email.value);
    if (existing) throw new EmailAlreadyInUse();

    const account = Account.register({ name: input.name, email });
    await this.repo.save(account);
    return account;
  }
}
