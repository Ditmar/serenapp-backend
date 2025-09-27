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

1. Domain: behavior/port

- If you need to persist a new state, update `Account` and/or add a method.
- Add/adjust the port in `src/domain/accounts/ports/AccountRepository.ts` if you need a new repo method.

2. Application: use case + DTOs

- Create `src/application/accounts/dto/DeactivateAccountDTO.ts`.
- Create `src/application/accounts/use-cases/DeactivateAccount.ts`:

```ts
// ...existing imports...
import type { AccountRepository } from '@domain/accounts/ports/AccountRepository';

export interface DeactivateAccountDTO {
  id: string;
}

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

3. Infrastructure (HTTP): route + controller

- In `src/infrastructure/http/express/controllers/`, add a controller that calls the use case and maps domain errors to HTTP.
- In `src/infrastructure/http/express/routes/account.routes.ts` add:

```ts
r.post('/deactivate', deactivateAccountController(deps.deactivateAccount));
```

4. Infrastructure (Persistence): repository

- Implement the new port methods under `src/infrastructure/persistence/repositories/` (e.g., `findById`). Make sure repositories use domain entities, not Prisma types.

5. Bootstrap: wiring

- In `src/bootstrap/app.ts` instantiate the repo and inject it into the new use case:

```ts
const accountRepo = new PrismaAccountRepository();
const deactivateAccount = new DeactivateAccount(accountRepo);
app.use('/accounts', accountRouter({ registerAccount, deactivateAccount }));
```

6. Mappers and validation

- Put DTOs in Application and do input validation at the HTTP layer (e.g., `zod` in the controller) if needed.
- Use mappers for clean API responses.

7. Tests (recommended)

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

1. Install deps

```powershell
npm install
```

2. Prepare Husky (if `.husky/` is missing)

```powershell
npm run prepare
```

3. Generate Prisma client and run in dev

```powershell
npm run prisma:generate
npm run dev
```

4. Try it

- `GET http://localhost:3000/health`
- `POST http://localhost:3000/accounts` with `{ "name": "John", "email": "john@example.com" }`

---

If you want to add more (domain events, unit of work, a DI container, etc.), we can layer that in when it’s useful.

---

# 📄 Database Design

This section describes the design of the appointment management system database, its entities, attributes, relationships, and justification for the decisions made.

---

## 1. General Considerations

- **Engine**: PostgreSQL
- **ORM**: Prisma
- **Strategy**: Multitenant with logical separation by `tenantId` in most models.
- **Identifiers**: All models use `cuid()` as the primary key, ensuring global uniqueness.
- **Times**: Each entity has `createdAt` and/or `updatedAt` fields, as appropriate, for traceability.

---

## 2. Main Models

### 2.1. **Tenant**

- Represents an **organization/brand** that uses the system.
- Attributes:
- `id`, `name`, `slug` (unique identifier for URLs).
- `plan`: Subscription plan (`basic`, etc.).
- `status`: Tenant status (`active`, etc.).
- `timeZone`: Time zone for scheduling.
- `leadTimeMin`: Minimum advance time for booking.
- `maxAdvanceDays`: Maximum number of days that can be scheduled.
- `createdAt`, `updatedAt`.

- Relationships:
- With `User`, `Staff`, `Client`, `Service`, `Booking`, `Block`, `AvailabilityRule`, `Notification`, `NotificationTemplate`, `Invite`.

➡️ Central point of multi-tenancy. Each piece of data is always linked to a Tenant.

---

### 2.2. **User**

- Represents **individual users** within a Tenant.
- Attributes:
- `id`, `tenantId`, `email`, `password`, `firstName`, `lastName`, `phone`.
- `createdAt`, `updatedAt`.

- Relationships:
- Can be linked to `Staff` or `Client`.
- Has roles (`UserRole`).
- Can issue `Invite`.
- Session tokens (`RefreshToken`).

➡️ Super-entity that allows Staff and Client to be represented without redundant core data.

---

### 2.3. **UserRole**

- Defines the roles a `User` can have within a Tenant.
- Attributes:
- `userId` + `role` = PK.
- Roles: `CLIENT`, `PROVIDER`, `ADMIN`.

➡️ Supports multiple roles per user within a single Tenant.

---

### 2.4. **Staff**

- Represents a **service provider** within a Tenant.
- Attributes:
- `id`, `tenantId`, `userId` (optional relationship with `User`).
- `name`, `email`, `phone`.

- Relationships:
- `blocks`: Schedule blocks.
- `bookings`: Bookings in which the provider participates.
- `services`: Services offered (`StaffService`).
- `rules`: Availability (`AvailabilityRule`).

➡️ Central for defining availability and service assignment.

---

### 2.5. **Client**

- Represents the **clients** who book services.
- Attributes:
- `id`, `tenantId`, `userId` (optional).
- `name`, `email`, `phone`, `notes`.

- Relationships:
- Can have multiple `Booking` objects.

➡️ Records the information of service consumers.

---

### 2.6. **Service**

- Defines the services offered by a Tenant.
- Attributes:
- `id`, `tenantId`, `name`, `category`.
- `description`, `durationMin`, `price`.
- `active`: Availability control.
- `bufferBefore`, `bufferAfter`: Preparation and closing times.

- Relationships:
- `bookings`: Reservations.
- `staff`: N:M relationship via `StaffService`.

➡️ Each service can customize its scheduling logic with buffers.

---

### 2.7. **StaffService**

- N:M relationship between `Staff` and `Service`.
- Attributes:
- `staffId`, `serviceId`, `tenantId`.

- Logical constraint: Both must belong to the same Tenant.

➡️ Indicates which Staff offers which services.

---

### 2.8. **AvailabilityRule**

- Defines the availability rules for a `Staff`.
- Attributes:
- `id`, `tenantId`, `staffId`.
- `type`: `weekly`, `monthly`, `exception`.
- `dow`: Day of the week (1-7).
- `dom`: Day of the month (1-31).
- `rrule`: Advanced rule in iCal format.
- `startTime`, `endTime`: Time windows.
- `date`: For exceptions.
- `available`: Defines availability or restriction.

- Indexes to optimize searches by Tenant, Staff, and dates.

➡️ Flexible availability engine that supports recurring rules.

---

### 2.9. **Block**

- Represents specific blocks in a Staff's schedule.
- Attributes:
- `id`, `tenantId`, `staffId`.
- `startsAt`, `endsAt`.
- `reason`.

➡️ Used for vacations, leaves, and temporary unavailability.

---

### 2.10. **Booking**

- Represents a **service reservation** between Client and Staff.
- Attributes:
- `id`, `tenantId`, `clientId`, `providerId`, `serviceId`.
- `startsAt`, `endsAt`.
- `status`: Enum `BookingStatus`.
- `price`, `requestId`.
- `createdAt`, `updatedAt`.

- Relationships:
- `events`: History of status changes (`BookingEvent`).

➡️ Main transactional entity of the system.

---

### 2.11. **BookingEvent**

- History of events in a reservation.
- Attributes:
- `id`, `bookingId`.
- `from`, `to`: Reservation statuses.
- `actor`: User or system.
- `notes`.
- `at`: Time of change.

➡️ Allows auditing and traceability of reservations.

---

### 2.12. **Invite**

- Represents invitations to new users within a Tenant.
- Attributes:
- `id`, `tenantId`, `invitedBy` (FK to `User`).
- `role`: Role assigned to the invitee.
- `tokenHash`: Unique identifier.
- `expiresAt`, `usedAt`.
- `createdBy`: Traceability.

➡️ Supports invitation, reward, and auditing programs.

---

### 2.13. **NotificationTemplate**

- Configurable notification templates.
- Attributes:
- `id`, `tenantId`.
- `event`, `channel`, `subject`, `body`.

➡️ Centralizes message definition (email/webhook).

---

### 2.14. **Notification**

- Represents a specific notification sent.
- Attributes:
- `id`, `tenantId`.
- `event`, `channel`.
- `status`: Enum `NotificationStatus` (`QUEUED`, `SENT`, `FAILED`).
- `payload`: Data sent.
- `createdAt`.

➡️ Allows monitoring of notification sending.

---

### 2.15. **RefreshToken**

- Manages session tokens.
- Attributes:
- `id`, `userId`.
- `tokenHash` (unique).
- `revoked`.
- `issuedAt`, `expiresAt`.

➡️ Base for authentication and session renewal.

---

## 3. Enums

- **Role**: `CLIENT`, `PROVIDER`, `ADMIN`.
- **RuleType**: `weekly`, `monthly`, `exception`.
- **BookingStatus**: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `SUGGESTED`, `CONFIRMED`, `CANCELLED_BY_CLIENT`, `CANCELLED_BY_PROVIDER`, `RESCHEDULED`.
- **NotificationStatus**: `QUEUED`, `SENT`, `FAILED`.

---

## 4. Key Design Decisions

1. **User as a super-entity**: Avoids redundancy between Staff and Client.
2. **Buffers in Service**: Facilitate simple time management; can be moved to StaffService in the future.
3. **Invite linked to User**: Allows auditing and referral programs.
4. **AvailabilityRule enriched** with `rule` and `available` for greater flexibility.
5. **Tenant as root entity**: Everything is segmented by Tenant to support multi-tenancy.
6. **BookingEvent for audit trail**: Essential for tracking reservation history.
7. **NotificationTemplate and Notification separation**: Allows reusable templates and tracking of individual notifications.
8. **RefreshToken for secure sessions**: Enables long-lived sessions with revocation capability.

---

## 📖 Data Dictionary (Explanatory)

---

### **Tenant**

- `id`: Unique identifier for the workspace (multi-tenant).
- `name`: Display name of the tenant (e.g., company or clinic name).
- `slug`: Unique identifier in URLs or subdomains.
- `plan`: Indicates the contracted plan (e.g., basic, premium).
- `status`: Allows you to activate/deactivate tenants without deleting them.
- `timeZone`: Necessary to properly manage schedules in each region.
- `leadTimeMin`: Minimum advance time that can be booked (prevents immediate bookings).
- `maxAdvanceDays`: Maximum advance time allowed (e.g., no more than 60 days in the future).
- `createdAt` / `updatedAt`: Audit control and data synchronization.

> **Why it exists**: Allows you to segment data and configurations by organization, supporting multiple clients in a single system instance.

---

### **User**

- `id`: Unique user identifier.
- `tenantId`: Relationship to the tenant, ensuring that each user belongs to a single space.
- `email`: Primary means of authentication.
- `password`: Encrypted credential for access.
- `firstName` and `lastName`: For personal identification in interfaces and notifications.
- `phone`: Optional field, useful for SMS notifications or direct contact.
- `createdAt` / `updatedAt`: Audit of creation and changes.

Relationships:

- Connects to `Staff` or `Client`, allowing a single model to represent both roles.
- `roles`: List of assigned roles (e.g., ADMIN, PROVIDER, CLIENT).
- `RefreshToken`: Active tokens for secure sessions.

> **Why it exists**: Centralizes user management, avoiding data duplication and facilitating authentication and authorization.

---

### **Staff**

- `id`: Unique staff identifier.
- `tenantId`: Defines the organization to which the staff belongs.
- `userId`: Reference to the base user (`User` supertable).
- `name`, `email`, `phone`: Redundant contact information for cases where there is no linked `User`.
- `blocks`: Relation to blocked periods (e.g., vacations).
- `bookings`: Relation to reservations assigned to the staff.
- `services`: Services that can be offered.
- `rules`: Configured availability rules.

> **Why it exists**: Allows you to manage the staff providing services, their availability, and appointment assignments.

---

### **Client**

- `id`: Unique client identifier.
- `tenantId`: Relationship to the organization.
- `userId`: Reference to the base user if registered as a user.
- `name`, `email`, `phone`: Identification and contact information.
- `notes`: Internal observations (e.g., allergies, preferences).
- `bookings`: History of reservations made.

> **Why it exists**: Allows you to manage information about service consumers, linking them to users if necessary.

---

### **Service**

- `id`: Unique service identifier.
- `tenantId`: Relationship to the tenant.
- `name`: Display name of the service (e.g., general query).
- `category`: Allows grouping of similar services.
- `description`: Free text explaining the service.
- `durationMin`: Duration in minutes, required for scheduling slots.
- `price`: Cost of the service (decimal for greater precision).
- `active`: Flag to activate/deactivate services without deleting them.
- `bufferBefore` / `bufferAfter`: Extra minutes before/after the service, for preparation or breaks.
- `bookings`: Reservations that include this service.
- `staff`: Relationship to the staff offering it.

> **Why it exists**: Allows you to clearly define what services are offered, their features, and costs.

---

### **StaffService**

This model represents the **N:M** relationship between a Staff and a Service.

- `staffId`: Identifies the staff member offering the service.
- `serviceId`: Identifies the service being offered.
- `tenantId`: Ensures that both the staff and the service belong to the same tenant.
- `staff`: Relationship to the Staff entity.
- `service`: Relationship to the Service entity.

> **Why it exists**: Allows you to associate which services each staff member offers, and is extensible to add specific configuration (e.g., custom buffers or different pricing in the future).

---

### **AvailabilityRule**

Defines recurring availability rules or exceptions for a Staff.

- `id`: Unique identifier of the rule.
- `tenantId`: Defines which organization the rule belongs to.
- `staffId`: Relates the rule to the affected staff member.
- `type`: Rule type (`weekly`, `monthly`, `exception`).
- `dow`: Day of the week (1..7) for weekly rules.
- `dom`: Day of the month (1..31) for monthly rules.
- `rrule`: iCal RRULE expression for more complex rules (e.g., "every 2 weeks").
- `startTime`: Start time in `HH:mm` format.
- `endTime`: End time in `HH:mm` format.
- `date`: Specific date in case of exception (e.g., holiday).
- `available`: Indicates whether the staff member is available or not during that time.
- `createdAt`: When the rule was created.

> **Why it exists**: Allows you to model recurring schedules and exceptions, providing flexibility in each staff member's schedule.

---

### **Block**

Specific time blocks on a Staff member's calendar.

- `id`: Unique identifier for the block.
- `tenantId`: Relationship to the tenant.
- `staffId`: Relationship to the affected staff member.
- `startsAt`: Start date and time of the block.
- `endsAt`: End date and time of the block.
- `reason`: Optional text explaining the reason (e.g., vacation, training).
- `createdAt`: Date the block was registered.

> **Why it exists**: Allows you to manually block time slots during which the staff member is unavailable.

---

### **Booking**

Recording a reservation between a Client and a Staff member for a Service.

- `id`: Unique identifier for the reservation.
- `tenantId`: Relationship to the tenant.
- `clientId`: Client who made the reservation.
- `providerId`: Staff assigned as the service provider.
- `serviceId`: Reserved service.
- `startsAt`: Start date and time.
- `endsAt`: End date and time.
- `status`: Current status of the reservation (`PENDING`, `APPROVED`, `CANCELLED`, etc.).
- `price`: Agreed price for the reservation (may vary from the base service).
- `requestId`: External unique identifier to manage idempotency of requests.
- `createdAt` / `updatedAt`: Creation and modification control.

Relationship:

- `events`: History of reservation status changes.

> **Why it exists**: It is the core of the system; it records each appointment with all its time, cost, and status data.

---

### **BookingEvent**

Status change history for a Booking.

- `id`: Unique event identifier.
- `bookingId`: Reservation to which the event belongs.
- `from`: Previous reservation status.
- `to`: New status.
- `actor`: Who caused the change (`userId` or `system`).
- `notes`: Optional observations.
- `at`: Date and time the event occurred.

> **Why it exists**: Allows you to audit and track the history of each reservation, showing its status evolution.

---

### **Invite**

Records user invitations to a Tenant.

- `id`: Unique invitation identifier.
- `tenantId`: Tenant to whom the invitation is extended.

- `invitedBy`: Identifier of the user who issued the invitation.
- `User`: Relationship to the inviting user.
- `role`: Role assigned to the invitee (e.g., CLIENT, PROVIDER, ADMIN).
- `tokenHash`: Secure token to accept the invitation.
- `expiresAt`: Expiration date of the invitation.
- `usedAt`: Date the invitation was used.
- `createdBy`: Audit information on who generated the invitation (may duplicate invitedBy in certain cases).

> **Why it exists**: Controls the flow of secure invitations for new users to join a tenant with a specific role.

---

### **NotificationTemplate**

Reusable templates for notification events.

- `id`: Unique identifier.
- `tenantId`: Tenant who owns the template.
- `event`: Type of event it responds to (e.g., `booking.confirmed`).
- `channel`: Delivery method (email, webhook).
- `subject`: Subject (applicable to email).
- `body`: Main content of the notification.

> **Why it exists**: Allows you to customize notifications per tenant, ensuring consistent and configurable messages.

---

### **Notification**

Specific instance of a notification event sent or pending.

- `id`: Unique identifier.
- `tenantId`: Associated tenant.
- `event`: Event that triggers the notification.
- `channel`: Delivery method (email, webhook).
- `status`: Notification status (QUEUED, SENT, FAILED).
- `payload`: JSON data accompanying the notification.
- `createdAt`: Date created.

> **Why it exists**: Allows you to manage the lifecycle of each notification, including retries and auditing.

---

### **RefreshToken**

Refresh tokens to maintain user sessions.

- `id`: Unique identifier.
- `userId`: User to whom the token belongs.
- `user`: Relationship to the User entity.
- `tokenHash`: Unique value of the refresh token.
- `revoked`: Flag indicating whether the token has been invalidated.
- `issuedAt`: Date issued.
- `expiresAt`: Expiration date.

> **Why it exists**: Allows you to securely manage long sessions, making it possible to revoke tokens without invalidating general system access.

---
