import { describe, it, expect } from 'vitest';

import { Email } from '@domain/accounts/value-objects/Email';

describe('Email VO', () => {
    it('creates a valid email (trim + lowercase)', () => {
        const email = Email.create('  John.Doe@Example.COM ');
        expect(email.value).toBe('john.doe@example.com');
    });

    it('throws on invalid email', () => {
        expect(() => Email.create('not-an-email')).toThrow('Invalid email');
    });
});
