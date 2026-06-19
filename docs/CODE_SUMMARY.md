## Backend (Node.js + Express + PGSQL)

## Overview

This backend powers a multi-tenant CMS where creators can manage programs and sessions. The architecture follows a layered Express application structure with clear separation between routing, request validation, business logic, persistence, and infrastructure utilities.

Tenant isolation is enforced using row-level ownership via `creatorId`, ensuring creators can only access their own programs, sessions, uploads, and audit logs. The codebase is designed for readability and straightforward extension rather than deep abstraction.

---

## `config/`

This module contains database configuration and migration-related setup. It centralizes environment-specific configuration so development, testing, and production can use different database settings without changing application code.

The main design choice here was to keep ORM configuration isolated from runtime business logic. This makes migrations and local setup predictable and reduces coupling between infrastructure and API layers.

When extending the system for multiple environments or CI pipelines, this folder is the primary place to modify connection behavior.

---

## `controllers/`

This folder contains the main API business logic for audit logs, programs, and sessions. Controllers are responsible for validating business rules, interacting with models, and returning HTTP responses.

I intentionally kept controllers thin enough to remain readable while still holding core business logic instead of introducing a separate service layer. For this project’s size, this reduces indirection and makes debugging easier.

Most tenant enforcement happens here by adding `creatorId` filters to database queries. Any new controller should preserve this pattern to avoid cross-tenant data leakage.

---

## `controllers/auth/`

This module handles authentication workflows including signup, login, logout, and password reset. Authentication is JWT-based and stateless, allowing the backend to scale horizontally without server-side session storage.

The key design choice was using middleware-populated request context so downstream controllers don’t need to repeatedly decode tokens. Once authenticated, the creator identity is attached to the request object and reused throughout the request lifecycle.

Future improvements could include refresh tokens, session invalidation, and stronger password reset protections.

---

## `middlewares/`

This folder contains cross-cutting request processing logic including authentication, authorization, request validation, and request context injection.

Authentication middleware verifies JWTs and attaches creator identity to the request. Authorization middleware ensures protected resources belong to the authenticated tenant. Validation middleware prevents malformed input from reaching controllers.

The request-context middleware is particularly important because it attaches metadata such as tenant ID and request ID, which are used by logging and audit systems. New middleware should remain composable and side-effect aware.

---

## `migrations/`

This folder contains database schema evolution scripts. Migrations define tables, columns, constraints, indexes, and schema changes in a version-controlled way.

I chose migrations over schema auto-sync in production because explicit schema evolution is safer and easier to audit. This prevents accidental destructive changes and supports reproducible deployments.

When modifying models, corresponding migrations should always be added to keep ORM definitions and database schema aligned.

---

## `models/`

This module defines the Sequelize models: `Audit`, `Creator`, `Program`, and `Session`, along with their associations.

The schema models a hierarchy:

- A creator owns many programs
- A program owns many sessions
- Audit logs track creator actions

The key design choice was embedding tenant ownership directly in relational tables using `creatorId`. This enables simple row-level isolation using indexed query filters. Any future models should include tenant ownership if they represent tenant-scoped resources.

---

## `routes/`

This folder maps HTTP endpoints to controller handlers for audit, auth, programs, and sessions.

Routes are intentionally lightweight and only handle endpoint registration plus middleware composition. This separation keeps API surface definitions easy to scan and makes authorization rules explicit at route level.

When adding new APIs, routes should declare middleware order carefully: validation → authentication → authorization → controller.

---

## `seeders/`

This module populates development and test databases with sample data.

The seed script creates:

- 2 creators
- 3 programs per creator
- ~10 sessions per program

The purpose is not realism but deterministic functional testing. Seed data helps validate tenant isolation, ordering logic, and session operations quickly during development.

---

## `tests/`

This folder contains automated tests, with primary focus on tenant isolation.

The most important invariant tested in this codebase is security: one creator must never access another creator’s data. Tests simulate authenticated requests across tenants to verify row-level isolation is consistently enforced.

As the project grows, this test suite should expand to include bulk import failures, upload authorization, and concurrency edge cases.

---

## `utils/`

This folder contains shared infrastructure helpers including audit logging, database initialization, structured logging, and S3 integration.

### `audit`

Encapsulates reusable audit log creation so controllers can record actions consistently without duplicating logic.

### `database`

Initializes Sequelize and manages database connectivity.

### `logger`

Provides structured application logs, including request metadata such as tenant and request IDs. This improves debugging and observability in multi-tenant systems.

### `s3`

Handles pre-signed upload URL generation and object lifecycle operations for file storage. Tenant-scoped object keys are used to reduce accidental cross-tenant access.

This folder is the primary place for reusable infrastructure code that doesn’t belong in controllers or middleware.

---

## Backend Extension Notes

If extending this codebase, the most important architectural rule is preserving tenant isolation. Every tenant-owned resource must be protected at both the API and database query layers.

The second key rule is maintaining auditability. Any mutating operation (create, update, delete, reorder, bulk import) should emit structured logs and audit records.

These two principles—tenant safety and traceability—drive most major design decisions in this system.

---

# Frontend (Next.js)

## Overview

The frontend is built using Next.js App Router and provides the UI for managing programs, sessions, uploads, and audit logs. It communicates with the backend through a thin API service layer and uses route-based organization for page-level features.

The frontend design prioritizes modular reusable components and clear separation between UI rendering, API communication, and helper utilities.

---

## `app/`

This folder contains route-based pages using the Next.js App Router.

### `app/dashboard/`

This module serves as the main landing page after authentication. It provides high-level navigation and acts as the entry point into the CMS workflow.

The dashboard is intentionally lightweight and focuses on quick access to programs and creator actions.

---

### `app/program/`

This route handles program management, including listing programs and navigating to program details.

Programs act as the parent resource for sessions, so this page is central to the application’s workflow.

---

### `app/program/[slug]/sessions/[sessionSlug]/`

This dynamic route renders session-specific views using program and session identifiers from the URL.

I chose dynamic route segments because they map naturally to hierarchical resources and improve deep-linking. This allows users to directly navigate to specific sessions without additional client-side routing logic.

When extending session functionality (analytics, comments, metadata), this route will likely remain the primary session workspace.

---

### `app/audit/`

This module displays audit logs generated by backend activity.

It gives creators visibility into system actions such as program creation, session changes, and bulk imports. The primary design goal is traceability and operational transparency.

As audit volume grows, this page would benefit from pagination, filtering, and search.

---

## `components/`

This folder contains reusable UI components used across routes.

---

### `bulk-upload/`

Provides the UI for CSV or bulk session import workflows.

This component handles file selection, validation feedback, and upload initiation. The main design goal was simplifying large-scale session creation while keeping error handling visible to users.

Future enhancements could include row-level validation previews before submission.

---

### `file-upload/`

Handles media upload interactions for session assets.

This component integrates with pre-signed S3 upload URLs to upload files directly from client to storage. This reduces backend load by avoiding proxy uploads through the API server.

Security-sensitive logic such as URL generation remains server-side.

---

### `manage-session/`

This component contains UI interactions related to session creation, editing, ordering, and management.

It centralizes session-specific controls so session workflows remain consistent across pages.

Because session ordering is business-critical, this component plays an important role in maintaining correct user interactions.

---

### `program-card/`

Displays program summaries in reusable card format.

It encapsulates visual presentation and navigation behavior for program entities. This keeps program listing pages clean and reduces duplication.

Additional metadata such as session counts or progress indicators can be added here later.

---

### `session-card/`

Displays session summaries and quick actions.

The component is optimized for readability and fast interaction, especially when working with many sessions within a program.

It can be extended to show status indicators, upload state, or completion metrics.

---

### `video-thumbnail/`

Responsible for rendering session video previews or thumbnails.

This improves visual discoverability of uploaded content and gives users quick confirmation of attached media.

Future improvements could include lazy loading and thumbnail caching.

---

## `helpers/`

This folder contains small reusable utility functions.

### `datetime-formatter`

Formats timestamps for display across the UI.

I isolated date formatting into a helper to keep components focused on rendering logic instead of formatting concerns. This also ensures consistent date formatting across dashboard, sessions, and audit logs.

If localization is added later, this helper becomes the central extension point.

---

## `services/`

This folder abstracts API communication between frontend and backend.

The main design choice was separating HTTP calls from UI components. This keeps components easier to test and prevents API logic from spreading across the codebase.

---

### `audit-logs.api.js`

Handles fetching audit log data.

Supports log listing, filtering, and pagination-related API calls.

---

### `auth.api.js`

Handles authentication workflows such as signup, login, logout, and password reset.

Authentication state depends on backend-issued JWT tokens.

---

### `programs.api.js`

Handles program-related API requests including fetching, creation, and updates.

Acts as the frontend abstraction over program endpoints.

---

### `sessions.api.js`

Handles session-related operations such as create, update, reorder, and upload-related requests.

This service is central to the core product workflow.

---

## `middleware.js`

This file implements frontend route protection using Next.js middleware.

It acts as an authentication guard by checking whether the user is authenticated before allowing access to protected routes. Unauthorized users are redirected to login.

The key design choice was enforcing route-level protection before rendering pages, improving both UX and security by avoiding protected page flashes.

---

## Frontend Extension Notes

When extending the frontend, the most important principle is maintaining separation between UI components and API services.

Complex business logic should remain in backend controllers whenever possible, while the frontend focuses on state management, rendering, and user interactions. This keeps the architecture maintainable as features grow.
