export class EmailAlreadyInUse extends Error {
  constructor() { super('Email already in use'); }
}
