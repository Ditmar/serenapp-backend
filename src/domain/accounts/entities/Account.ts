import { Email } from '../value-objects/Email';

export interface AccountProps {
  id?: string;
  name: string;
  email: Email;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Account {
  private constructor(private props: Required<AccountProps>) {}

  static register(props: { name: string; email: Email }) {
    return new Account({
      id: crypto.randomUUID(),
      name: props.name,
      email: props.email,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  static fromPersistence(row: {
    id: string; name: string; email: string; createdAt: Date; updatedAt: Date;
  }) {
    return new Account({
      id: row.id,
      name: row.name,
      email: Email.create(row.email),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }

  toPersistence() {
    return {
      id: this.props.id,
      name: this.props.name,
      email: this.props.email.value,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt
    };
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get email() { return this.props.email; }
}
