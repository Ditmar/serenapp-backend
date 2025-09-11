# Hex API — Hexagonal Architecture (TypeScript)

This project uses a clean hexagonal setup (ports and adapters) with TypeScript, Express, and Prisma. The main idea: keep the domain isolated from infrastructure so the code stays easy to change, test, and scale.

## Folder layout

```
src/
  domain/                  # Business core (entities, VOs, ports)
    accounts/
      entities/            # Domain entities
      value-objects/       # Value objects (e.g., Email)
      ports/               # Interfaces (ports) defined by the domain
      errors/              # Domain errors
  application/             # Use cases, DTOs, mappers
    accounts/
      use-cases/
      dto/
      mappers/
  infrastructure/          # Adapters (HTTP, DB, logger, config)
    http/express/          # Express controllers and routes
    persistence/           # Prisma client and repositories
    config/                # Env loading/validation
    observability/         # Logger, tracing, etc.
  bootstrap/               # Wiring and HTTP startup
  shared/                  # Shared utils (Result, Guard, etc.)
```

Aliases (tsconfig):
- `@domain/*` → `src/domain/*`
- `@app/*` → `src/application/*`
- `@infra/*` → `src/infrastructure/*`
- `@shared/*` → `src/shared/*`

## Dependency rules (important)
- Domain must NOT import from Application or Infrastructure.
- Application depends on Domain (and `@shared` if needed). It must NOT depend on Infrastructure.
- Infrastructure implements domain ports and exposes adapters; Domain never imports it.
- HTTP (Express) lives in Infrastructure and calls Application (use cases).

ESLint enforces these with `import/no-restricted-paths`.

## Scripts

```powershell
npm run dev        # Run app in watch mode (src/main.ts)
npm run build      # Compile to dist/
npm run start      # Run built app (dist/main.js)
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint (flat config)
npm run lint:fix   # ESLint with autofix
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

## Environment variables
`src/infrastructure/config/env.ts` validates with `zod`:
- `DATABASE_URL` (valid URL)
- `PORT` (defaults to 3000)
- `NODE_ENV` (development | test | production)

Example `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/hex_api?schema=public"
PORT=3000
NODE_ENV=development
```

## Sample endpoints
- `GET /health` → `{ ok: true }`
- `POST /accounts` → creates an account
  - body: `{ "name": "John", "email": "john@example.com" }`
  - 201 with `{ id, name, email }`
  - 409 if email already exists
  - 400 if email is invalid

## How to add a new service (use case)
Say you need “DeactivateAccount”. Here’s the minimal path:

1) Domain: behavior/port
- If you need to persist a new state, update `Account` and/or add a method.
- Add/adjust the port in `src/domain/accounts/ports/AccountRepository.ts` if you need a new repo method.

2) Application: use case + DTOs
- Create `src/application/accounts/dto/DeactivateAccountDTO.ts`.
- Create `src/application/accounts/use-cases/DeactivateAccount.ts`:
```ts
// ...existing imports...
import type { AccountRepository } from '@domain/accounts/ports/AccountRepository';

export interface DeactivateAccountDTO { id: string }

export class DeactivateAccount {
  constructor(private readonly repo: AccountRepository) {}

  async execute(input: DeactivateAccountDTO) {
    const acc = await this.repo.findById(input.id);
    if (!acc) throw new Error('Account not found');
    // Domain logic here: acc.deactivate();
    await this.repo.save(acc);
    return acc;
  }
}
```

3) Infrastructure (HTTP): route + controller
- In `src/infrastructure/http/express/controllers/`, add a controller that calls the use case and maps domain errors to HTTP.
- In `src/infrastructure/http/express/routes/account.routes.ts` add:
```ts
r.post('/deactivate', deactivateAccountController(deps.deactivateAccount));
```

4) Infrastructure (Persistence): repository
- Implement the new port methods under `src/infrastructure/persistence/repositories/` (e.g., `findById`). Make sure repositories use domain entities, not Prisma types.

5) Bootstrap: wiring
- In `src/bootstrap/app.ts` instantiate the repo and inject it into the new use case:
```ts
const accountRepo = new PrismaAccountRepository();
const deactivateAccount = new DeactivateAccount(accountRepo);
app.use('/accounts', accountRouter({ registerAccount, deactivateAccount }));
```

6) Mappers and validation
- Put DTOs in Application and do input validation at the HTTP layer (e.g., `zod` in the controller) if needed.
- Use mappers for clean API responses.

7) Tests (recommended)
- Unit test VOs/Entities.
- Unit test use cases (with a mocked repo).
- Integration test repositories (Prisma) and E2E test Express routes.

## ESLint, Prettier, and Husky

- ESLint v9 (flat config) — `eslint.config.js`:
  - Key rules:
    - `@typescript-eslint/consistent-type-imports` (use `import type`).
    - `import/order` with groups and path aliases for tidy imports.
    - `import/no-restricted-paths` to protect hex boundaries.
    - `quotes: ['error', 'single', { avoidEscape: true }]` for single quotes.
  - Ignores: `dist/`, `node_modules/`, `coverage/`, `.prisma/`.

- Prettier — `.prettierrc.json` sets `singleQuote: true` to match ESLint.

- Husky — Git hooks in `.husky/`:
  - `commit-msg`: validates commits with `@commitlint` and enforces allowed prefixes.
  - `pre-commit`: runs `typecheck` and `lint` (and `lint-staged` if present).
  - `pre-push`: blocks pushes if `typecheck` or `lint` fail.

- Commitlint — `commitlint.config.cjs`:
  - Allowed types: `feat`, `fix`, `release`, `hotfix`.
  - Suggested format:
    - `feat: add register endpoint`
    - `fix: validate email properly`

## Troubleshooting

- ESLint v9 warning about `.eslintignore`:
  - Use only `eslint.config.js` (ignores are defined there) and remove legacy `.eslintignore`/`.eslintrc.*` if needed.

- Windows + Husky (sh scripts):
  - Requires Git Bash or another POSIX shell in PATH (install Git for Windows).

- `lint-staged` needs Node >= 20.17 (EBADENGINE warning):
  - Options:
    - Update Node to >= 20.17.
    - Or pin `lint-staged` to v15 to avoid the warning.

- Prisma `DATABASE_URL` invalid or DB down:
  - Check `.env` and that your DB is running.
  - Run `npm run prisma:generate` after editing `schema.prisma`.
  - Apply schema changes with `npm run prisma:migrate`.

- Import paths/aliases breaking:
  - Use the path aliases (`@domain`, `@app`, `@infra`, `@shared`) and keep the dependency rules.

## Run the project

1) Install deps
```powershell
npm install
```

2) Prepare Husky (if `.husky/` is missing)
```powershell
npm run prepare
```

3) Generate Prisma client and run in dev
```powershell
npm run prisma:generate
npm run dev
```

4) Try it
- `GET http://localhost:3000/health`
- `POST http://localhost:3000/accounts` with `{ "name": "John", "email": "john@example.com" }`

---

If you want to add more (domain events, unit of work, a DI container, etc.), we can layer that in when it’s useful.
