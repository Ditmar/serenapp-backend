import { describe, it, expect } from 'vitest';

import { Account } from '@domain/accounts/entities/Account';
import { Email } from '@domain/accounts/value-objects/Email';

describe('Account Entity', () => {
    it('registers a new account with id and timestamps', () => {
        const email = Email.create('jane@example.com');
        const acc = Account.register({ name: 'Jane', email });

        expect(acc.id).toBeTypeOf('string');
        expect(acc.name).toBe('Jane');
        expect(acc.email.value).toBe('jane@example.com');
    });

    it('serializes to persistence shape', () => {
        const email = Email.create('bob@example.com');
        const acc = Account.register({ name: 'Bob', email });
        const row = acc.toPersistence();

        expect(row).toMatchObject({
            id: acc.id,
            name: 'Bob',
            email: 'bob@example.com',
        });
    });
});
