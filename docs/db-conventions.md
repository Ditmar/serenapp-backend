# 📄 Diseño de Base de Datos

Este documento describe el diseño de la base de datos del sistema de gestión de citas, sus entidades, atributos, relaciones y justificación de las decisiones tomadas.

---

## 1. Consideraciones generales

- **Motor**: PostgreSQL
- **ORM**: Prisma
- **Estrategia**: Multitenant con separación lógica por `tenantId` en la mayoría de los modelos.
- **Identificadores**: Todos los modelos usan `cuid()` como clave primaria, garantizando unicidad global.
- **Tiempos**: Cada entidad tiene campos `createdAt` y/o `updatedAt` según corresponda para trazabilidad.

---

## 2. Modelos principales

### 2.1. **Tenant**

- Representa una **organización/marca** que utiliza el sistema.
- Atributos:
  - `id`, `name`, `slug` (identificador único para URLs).
  - `plan`: Plan de suscripción (`basic`, etc.).
  - `status`: Estado del Tenant (`active`, etc.).
  - `timeZone`: Zona horaria para agendamiento.
  - `leadTimeMin`: Anticipación mínima para reservar.
  - `maxAdvanceDays`: Máximo de días que se puede agendar.
  - `createdAt`, `updatedAt`.

- Relaciones:
  - Con `User`, `Staff`, `Client`, `Service`, `Booking`, `Block`, `AvailabilityRule`, `Notification`, `NotificationTemplate`, `Invite`.

➡️ Punto central de la multitenencia. Cada dato está siempre ligado a un Tenant.

---

### 2.2. **User**

- Representa a **usuarios individuales** dentro de un Tenant.
- Atributos:
  - `id`, `tenantId`, `email`, `password`, `firstName`, `lastName`, `phone`.
  - `createdAt`, `updatedAt`.

- Relaciones:
  - Puede estar vinculado con `Staff` o `Client`.
  - Tiene roles (`UserRole`).
  - Puede emitir `Invite`.
  - Tokens de sesión (`RefreshToken`).

➡️ Superentidad que permite representar Staff y Client sin redundancia de datos básicos.

---

### 2.3. **UserRole**

- Define los roles que un `User` puede tener dentro de un Tenant.
- Atributos:
  - `userId` + `role` = PK.
  - Roles: `CLIENT`, `PROVIDER`, `ADMIN`.

➡️ Soporta múltiples roles por usuario en un mismo Tenant.

---

### 2.4. **Staff**

- Representa un **proveedor de servicios** dentro de un Tenant.
- Atributos:
  - `id`, `tenantId`, `userId` (relación opcional con `User`).
  - `name`, `email`, `phone`.

- Relaciones:
  - `blocks`: Bloqueos de agenda.
  - `bookings`: Reservas en las que participa.
  - `services`: Servicios que ofrece (`StaffService`).
  - `rules`: Disponibilidad (`AvailabilityRule`).

➡️ Central para definir disponibilidad y asignación de servicios.

---

### 2.5. **Client**

- Representa a los **clientes** que reservan servicios.
- Atributos:
  - `id`, `tenantId`, `userId` (opcional).
  - `name`, `email`, `phone`, `notes`.

- Relaciones:
  - Puede tener múltiples `Booking`.

➡️ Registra la información de los consumidores de servicios.

---

### 2.6. **Service**

- Define los servicios ofrecidos en un Tenant.
- Atributos:
  - `id`, `tenantId`, `name`, `category`.
  - `description`, `durationMin`, `price`.
  - `active`: Control de disponibilidad.
  - `bufferBefore`, `bufferAfter`: Tiempos de preparación y cierre.

- Relaciones:
  - `bookings`: Reservas.
  - `staff`: Relación N:M vía `StaffService`.

➡️ Cada servicio puede personalizar su lógica de agendamiento con buffers.

---

### 2.7. **StaffService**

- Relación N:M entre `Staff` y `Service`.
- Atributos:
  - `staffId`, `serviceId`, `tenantId`.

- Restricción lógica: Ambos deben pertenecer al mismo Tenant.

➡️ Indica qué Staff ofrece qué servicios.

---

### 2.8. **AvailabilityRule**

- Define las reglas de disponibilidad de un `Staff`.
- Atributos:
  - `id`, `tenantId`, `staffId`.
  - `type`: `weekly`, `monthly`, `exception`.
  - `dow`: Día de la semana (1-7).
  - `dom`: Día del mes (1-31).
  - `rrule`: Regla avanzada en formato iCal.
  - `startTime`, `endTime`: Ventanas horarias.
  - `date`: Para excepciones.
  - `available`: Define si es disponibilidad o restricción.

- Índices para optimizar búsquedas por Tenant, Staff y fechas.

➡️ Motor de disponibilidad flexible que soporta reglas recurrentes.

---

### 2.9. **Block**

- Representa bloqueos puntuales en la agenda de un `Staff`.
- Atributos:
  - `id`, `tenantId`, `staffId`.
  - `startsAt`, `endsAt`.
  - `reason`.

➡️ Se usa para vacaciones, permisos, indisponibilidad temporal.

---

### 2.10. **Booking**

- Representa una **reserva de servicio** entre Client y Staff.
- Atributos:
  - `id`, `tenantId`, `clientId`, `providerId`, `serviceId`.
  - `startsAt`, `endsAt`.
  - `status`: Enum `BookingStatus`.
  - `price`, `requestId`.
  - `createdAt`, `updatedAt`.

- Relaciones:
  - `events`: Historial de cambios de estado (`BookingEvent`).

➡️ Entidad transaccional principal del sistema.

---

### 2.11. **BookingEvent**

- Historial de eventos en una reserva.
- Atributos:
  - `id`, `bookingId`.
  - `from`, `to`: Estados de la reserva.
  - `actor`: Usuario o sistema.
  - `notes`.
  - `at`: Momento del cambio.

➡️ Permite auditoría y trazabilidad de las reservas.

---

### 2.12. **Invite**

- Representa invitaciones a nuevos usuarios dentro de un Tenant.
- Atributos:
  - `id`, `tenantId`, `invitedBy` (FK a `User`).
  - `role`: Rol asignado al invitado.
  - `tokenHash`: Identificador único.
  - `expiresAt`, `usedAt`.
  - `createdBy`: Trazabilidad.

➡️ Soporta programas de invitación, recompensas y auditoría.

---

### 2.13. **NotificationTemplate**

- Plantillas de notificaciones configurables.
- Atributos:
  - `id`, `tenantId`.
  - `event`, `channel`, `subject`, `body`.

➡️ Centraliza la definición de mensajes (email/webhook).

---

### 2.14. **Notification**

- Representa una notificación concreta enviada.
- Atributos:
  - `id`, `tenantId`.
  - `event`, `channel`.
  - `status`: Enum `NotificationStatus` (`QUEUED`, `SENT`, `FAILED`).
  - `payload`: Datos enviados.
  - `createdAt`.

➡️ Permite monitorear el envío de notificaciones.

---

### 2.15. **RefreshToken**

- Gestiona tokens de sesión.
- Atributos:
  - `id`, `userId`.
  - `token` (único).
  - `revoked`.
  - `issuedAt`, `expiresAt`.

➡️ Base para autenticación y renovación de sesiones.

---

## 3. Enums

- **Role**: `CLIENT`, `PROVIDER`, `ADMIN`.
- **RuleType**: `weekly`, `monthly`, `exception`.
- **BookingStatus**: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `SUGGESTED`, `CONFIRMED`, `CANCELLED_BY_CLIENT`, `CANCELLED_BY_PROVIDER`, `RESCHEDULED`.
- **NotificationStatus**: `QUEUED`, `SENT`, `FAILED`.

---

## 4. Decisiones de diseño clave

1. **User como superentidad**: Evita redundancia entre Staff y Client.
2. **Buffers en Service**: Facilitan gestión simple de tiempos; posibilidad futura de mover a StaffService.
3. **Invite vinculado a User**: Permite auditoría y programas de referidos.
4. **AvailabilityRule enriquecido** con `rrule` y `available` para mayor flexibilidad.
5. **Tenant como entidad raíz**: Todo se segmenta por Tenant para soportar multitenencia.

---

Perfecto 🙌. Lo que quieres es una **documentación tipo diccionario de datos narrativo**, es decir, explicar **por qué existe cada campo** y cuál es su propósito, pero en formato descriptivo (no en tablas).

Te muestro cómo quedaría para algunos modelos, y si te gusta, seguimos hasta cubrir todo el esquema.

---

## 📖 Diccionario de Datos (Explicativo)

---

### **Tenant**

- `id`: Identificador único del espacio de trabajo (multi-tenant).
- `name`: Nombre visible del tenant (ej. nombre de la empresa o clínica).
- `slug`: Identificador único en URLs o subdominios.
- `plan`: Indica el plan contratado (ej. básico, premium).
- `status`: Permite activar/desactivar tenants sin eliminarlos.
- `timeZone`: Necesario para manejar correctamente las agendas en cada región.
- `leadTimeMin`: Tiempo mínimo de anticipación con el que se puede reservar (evita reservas inmediatas).
- `maxAdvanceDays`: Máxima anticipación permitida (ej. no más de 60 días en el futuro).
- `createdAt` / `updatedAt`: Control de auditoría y sincronización de datos.

> **Por qué existe**: Permite segmentar datos y configuraciones por organización, soportando múltiples clientes en una sola instancia del sistema.

---

### **User**

- `id`: Identificador único del usuario.
- `tenantId`: Relación al tenant, garantiza que cada usuario pertenece a un solo espacio.
- `email`: Medio principal de autenticación.
- `password`: Credencial encriptada para acceso.
- `firstName` y `lastName`: Para identificación personal en interfaces y notificaciones.
- `phone`: Campo opcional, útil para notificaciones vía SMS o contacto directo.
- `createdAt` / `updatedAt`: Auditoría de creación y cambios.

Relaciones:

- Conecta con `Staff` o `Client`, permitiendo que un mismo modelo represente ambos roles.
- `roles`: Lista de roles asignados (ej. ADMIN, PROVIDER, CLIENT).
- `RefreshToken`: Tokens activos para sesiones seguras.

> **Por qué existe**: Centraliza la gestión de usuarios, evitando duplicación de datos y facilitando la autenticación y autorización.

---

### **Staff**

- `id`: Identificador único del personal.
- `tenantId`: Define a qué organización pertenece.
- `userId`: Referencia al usuario base (super tabla `User`).
- `name`, `email`, `phone`: Datos de contacto redundantes para casos en que no haya `User` vinculado.
- `blocks`: Relación a períodos bloqueados (ej. vacaciones).
- `bookings`: Relación con reservas asignadas al staff.
- `services`: Servicios que puede ofrecer.
- `rules`: Reglas de disponibilidad configuradas.

> **Por qué existe**: Permite gestionar el personal que ofrece servicios, su disponibilidad y asignación de citas.

---

### **Client**

- `id`: Identificador único del cliente.
- `tenantId`: Relación con la organización.
- `userId`: Referencia al usuario base si está registrado como usuario.
- `name`, `email`, `phone`: Datos de identificación y contacto.
- `notes`: Observaciones internas (ej. alergias, preferencias).
- `bookings`: Historial de reservas realizadas.

> **Por qué existe**: Permite gestionar la información de los consumidores de servicios, vinculándolos a usuarios si es necesario.

---

### **Service**

- `id`: Identificador único del servicio.
- `tenantId`: Relación con el tenant.
- `name`: Nombre visible del servicio (ej. consulta general).
- `category`: Permite agrupar servicios similares.
- `description`: Texto libre que explica en qué consiste el servicio.
- `durationMin`: Duración en minutos, necesario para agendar slots.
- `price`: Costo del servicio (decimal para mayor precisión).
- `active`: Bandera para activar/desactivar servicios sin borrarlos.
- `bufferBefore` / `bufferAfter`: Minutos extra antes/después del servicio, para preparación o descansos.
- `bookings`: Reservas que lo incluyen.
- `staff`: Relación con el personal que lo ofrece.

> **Por qué existe**: Permite definir claramente qué servicios se ofrecen, sus características y costos.

---

### **StaffService**

Este modelo representa la relación **N:M** entre un `Staff` y un `Service`.

- `staffId`: Identifica al miembro del staff que ofrece el servicio.
- `serviceId`: Identifica al servicio que se ofrece.
- `tenantId`: Garantiza que tanto el staff como el servicio pertenezcan al mismo tenant.
- `staff`: Relación hacia la entidad Staff.
- `service`: Relación hacia la entidad Service.

> **Por qué existe**: Permite asociar qué servicios ofrece cada miembro del staff, y es extensible para añadir configuración específica (ej. buffers personalizados o precios distintos en el futuro).

---

### **AvailabilityRule**

Define las reglas de disponibilidad recurrentes o excepciones de un `Staff`.

- `id`: Identificador único de la regla.
- `tenantId`: Define a qué organización pertenece la regla.
- `staffId`: Relaciona la regla con el miembro del staff afectado.
- `type`: Tipo de regla (`weekly`, `monthly`, `exception`).
- `dow`: Día de la semana (1..7) en caso de reglas semanales.
- `dom`: Día del mes (1..31) en caso de reglas mensuales.
- `rrule`: Expresión iCal RRULE para reglas más complejas (ej. "cada 2 semanas").
- `startTime`: Hora de inicio en formato `HH:mm`.
- `endTime`: Hora de fin en formato `HH:mm`.
- `date`: Fecha específica en caso de excepción (ej. día festivo).
- `available`: Indica si el staff está disponible o no en ese rango.
- `createdAt`: Cuándo se registró la regla.

> **Por qué existe**: Permite modelar horarios recurrentes y excepciones, dando flexibilidad en la agenda de cada staff.

---

### **Block**

Bloqueos específicos de tiempo en la agenda de un `Staff`.

- `id`: Identificador único del bloqueo.
- `tenantId`: Relación con el tenant.
- `staffId`: Relación con el miembro del staff afectado.
- `startsAt`: Fecha y hora de inicio del bloqueo.
- `endsAt`: Fecha y hora de fin del bloqueo.
- `reason`: Texto opcional explicando el motivo (ej. vacaciones, capacitación).
- `createdAt`: Fecha de registro del bloqueo.

> **Por qué existe**: Permite bloquear manualmente intervalos de tiempo en los que el staff no está disponible.

---

### **Booking**

Registro de una reserva entre un `Client` y un `Staff` para un `Service`.

- `id`: Identificador único de la reserva.
- `tenantId`: Relación con el tenant.
- `clientId`: Cliente que hizo la reserva.
- `providerId`: Staff asignado como proveedor del servicio.
- `serviceId`: Servicio reservado.
- `startsAt`: Fecha y hora de inicio.
- `endsAt`: Fecha y hora de fin.
- `status`: Estado actual de la reserva (`PENDING`, `APPROVED`, `CANCELLED`, etc.).
- `price`: Precio acordado para la reserva (puede variar respecto al servicio base).
- `requestId`: Identificador único externo para manejar idempotencia de solicitudes.
- `createdAt` / `updatedAt`: Control de creación y modificaciones.

Relación:

- `events`: Historial de cambios de estado de la reserva.

> **Por qué existe**: Es el núcleo del sistema, registra cada cita con todos sus datos de tiempo, costo y estado.

---

### **BookingEvent**

Historial de cambios de estado de un `Booking`.

- `id`: Identificador único del evento.
- `bookingId`: Reserva a la que pertenece el evento.
- `from`: Estado anterior de la reserva.
- `to`: Estado nuevo.
- `actor`: Quién provocó el cambio (`userId` o `"system"`).
- `notes`: Observaciones opcionales.
- `at`: Fecha y hora en que ocurrió el evento.

> **Por qué existe**: Permite auditar y rastrear el historial de cada reserva, mostrando la evolución de su estado.

---

### **Invite**

Registra invitaciones de usuarios a un `Tenant`.

- `id`: Identificador único de la invitación.
- `tenantId`: Tenant en el que se extiende la invitación.
- `invitedBy`: Identificador del usuario que realizó la invitación.
- `User`: Relación hacia el usuario invitador.
- `role`: Rol asignado al invitado (ej. CLIENT, PROVIDER, ADMIN).
- `tokenHash`: Token seguro para aceptar la invitación.
- `expiresAt`: Fecha de expiración de la invitación.
- `usedAt`: Fecha en que la invitación fue utilizada.
- `createdBy`: Información de auditoría de quién generó la invitación (puede duplicar invitedBy en ciertos casos).

> **Por qué existe**: Controla el flujo de invitaciones seguras para que nuevos usuarios se unan a un tenant con un rol específico.

---

### **NotificationTemplate**

Plantillas reutilizables para eventos de notificación.

- `id`: Identificador único.
- `tenantId`: Tenant propietario de la plantilla.
- `event`: Tipo de evento al que responde (ej. `booking.confirmed`).
- `channel`: Medio de envío (`email`, `webhook`).
- `subject`: Asunto (aplicable en email).
- `body`: Contenido principal de la notificación.

> **Por qué existe**: Permite personalizar notificaciones por tenant, asegurando mensajes consistentes y configurables.

---

### **Notification**

Instancia concreta de un evento de notificación enviado o pendiente.

- `id`: Identificador único.
- `tenantId`: Tenant asociado.
- `event`: Evento que dispara la notificación.
- `channel`: Medio de envío (`email`, `webhook`).
- `status`: Estado de la notificación (`QUEUED`, `SENT`, `FAILED`).
- `payload`: Datos en JSON que acompañan la notificación.
- `createdAt`: Fecha en que se creó.

> **Por qué existe**: Permite gestionar el ciclo de vida de cada notificación, incluyendo reintentos y auditoría.

---

### **RefreshToken**

Tokens de actualización para mantener sesiones de usuario.

- `id`: Identificador único.
- `userId`: Usuario al que pertenece el token.
- `user`: Relación hacia la entidad User.
- `token`: Valor único del refresh token.
- `revoked`: Bandera que indica si el token ha sido invalidado.
- `issuedAt`: Fecha en que se emitió.
- `expiresAt`: Fecha de expiración.

> **Por qué existe**: Permite manejar sesiones largas de manera segura, posibilitando revocar tokens sin invalidar el acceso general al sistema.

---
