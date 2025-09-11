export class Email {
  private constructor(public readonly value: string) {}

  static create(value: string) {
    const email = value?.trim().toLowerCase();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      throw new Error('Invalid email');
    }
    return new Email(email);
  }
}
