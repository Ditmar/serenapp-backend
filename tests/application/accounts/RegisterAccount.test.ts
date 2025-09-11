import { describe, it, expect, vi } from 'vitest';

import { Account } from '@domain/accounts/entities/Account';
import { EmailAlreadyInUse } from '@domain/accounts/errors/AccountErrors';
import { Email } from '@domain/accounts/value-objects/Email';

import { RegisterAccount } from '@app/accounts/use-cases/RegisterAccount';

const fakeRepo = () => {
    return {
        findByEmail: vi.fn(),
        save: vi.fn(),
    } as any;
};

describe('RegisterAccount Use Case', () => {
    it('creates an account when email is free', async () => {
        const repo = fakeRepo();
        repo.findByEmail.mockResolvedValue(null);

        const useCase = new RegisterAccount(repo);
        const result = await useCase.execute({ name: 'Ana', email: 'ana@example.com' });

        expect(result).toBeInstanceOf(Account);
        expect(repo.save).toHaveBeenCalledOnce();
    });

    it('throws EmailAlreadyInUse when email exists', async () => {
        const repo = fakeRepo();
        repo.findByEmail.mockResolvedValue(Account.register({ name: 'X', email: Email.create('x@example.com') }));

        const useCase = new RegisterAccount(repo);
        await expect(useCase.execute({ name: 'Ana', email: 'x@example.com' }))
            .rejects.toBeInstanceOf(EmailAlreadyInUse);
    });
});
