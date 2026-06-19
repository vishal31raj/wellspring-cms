## What I Built and What I Skipped

I built all major requirements of the assignment, including authentication, multi-tenant program and session management, bulk CSV upload, audit logging, tenant isolation, S3-based file uploads using pre-signed URLs, database migrations, seeders, and automated tests for tenant isolation.

The frontend was built using Next.js App Router, and the backend was built using Node.js, Express, and Sequelize with PostgreSQL.

The main thing I skipped was using TypeScript in the Node.js backend. This was not an intentional architectural decision. I noticed that requirement too late in the assignment, and given the time constraints, I prioritized completing all functional requirements over rewriting the backend in TypeScript. If I had started with TypeScript from the beginning, I would have used typed request objects, DTO validation, and stricter model typing to reduce runtime errors.

I also kept the backend architecture intentionally straightforward. I did not introduce a service layer, repository pattern, background job queues, or event-driven architecture because I felt those abstractions would add complexity without significant benefit at the current scale.

---

## Tenant Isolation Strategy

I chose row-level tenant isolation using a `creatorId` field across tenant-owned resources such as programs, sessions, uploads, and audit logs.

In practice, every authenticated request carries creator identity through JWT authentication middleware. The middleware decodes the token and attaches creator metadata to the request object. Controllers then enforce tenant boundaries by scoping database queries with `creatorId`.

Example:

```js
Program.findOne({
  where: {
    id: programId,
    creatorId: req.tenantId,
  },
});
```

I chose row-level isolation for three reasons:

1. Simplicity of implementation
2. Lower operational complexity
3. Good fit for the expected assignment scale

Compared to schema-per-tenant or database-per-tenant approaches, row-level filtering is much easier to develop and test locally.

### At 100 creators

At 100 creators, this architecture works comfortably.

The main requirements would be:

- Proper indexes on `creatorId`
- Query optimization
- Monitoring for slow queries

Most CRUD operations would remain efficient because datasets are still relatively small.

### At 10,000 creators

At 10,000 creators, I would start reconsidering some design choices.

The biggest risk is accidental tenant leakage caused by missing filters in application code. Right now, tenant isolation depends heavily on developer discipline. If one query forgets `creatorId`, cross-tenant exposure becomes possible.

To strengthen this at larger scale, I would consider:

- PostgreSQL Row Level Security (RLS)
- Query helpers that automatically inject tenant filters
- Partitioning large tables
- Dedicated analytics or audit storage

I would not immediately move to schema-per-tenant because that introduces migration and operational overhead. I would first strengthen row-level guarantees at the database level.

---

## Bulk Import Design

Bulk import allows creators to upload CSV data for session creation.

My goal was to support fast ingestion while preventing invalid data from partially corrupting the database.

The import flow is roughly:

1. User uploads CSV
2. Backend parses rows
3. Each row is validated
4. Valid rows are inserted into sessions table
5. Audit log records import activity

### Idempotency

I did not implement fully robust idempotency tokens, and this is one area I would improve.

Currently, repeated uploads of the same CSV may create duplicate sessions if the input rows are identical and no uniqueness constraint prevents insertion.

To reduce this risk, I rely on validation and application-level checks, but this is not true idempotency.

If I were improving this, I would add:

- Import batch IDs
- Content hashing of CSV files
- Duplicate detection using row signatures

That would allow safe retry behavior.

### Failure Modes Handled

I handle:

- Invalid CSV structure
- Missing required fields
- Invalid row values
- Non-existent parent program
- Tenant ownership violations

Current failure behavior is mostly fail-fast for invalid requests.

One limitation is transaction granularity. Depending on failure timing, partial inserts may occur if rows are inserted incrementally before later validation fails. A more robust design would wrap the full import inside a database transaction.

If scaling bulk import further, I would move processing into background jobs using a queue.

---

## S3 Upload Flow

For media uploads, I used pre-signed URLs with Amazon S3.

The flow is:

1. Frontend requests upload URL from backend
2. Backend validates creator and session ownership
3. Backend generates pre-signed PUT URL
4. Frontend uploads file directly to S3
5. Backend stores object metadata if needed

I chose this design because it avoids routing large files through the backend server, which reduces memory and CPU pressure.

### Security Considerations

Important security measures include:

#### Tenant Scoping

Each uploaded object is stored with tenant-scoped keys such as:

"creator-12/program-5/session-8/video.mp4"

This makes object ownership easier to reason about.

#### Authorization

Only authenticated creators can request upload URLs, and session ownership is verified before URL generation.

#### Time-Limited URLs

Pre-signed URLs expire quickly to reduce misuse.

#### File Validation

I validate file metadata such as type and size before issuing URLs.

### Large File Evolution

For very large files (hundreds of MB or GB), I would improve this flow using:

- Multipart uploads
- Resumable uploads
- Progress tracking
- Async processing pipeline
- CDN delivery

I would also consider generating thumbnails or media previews asynchronously after upload.

---

## Parts of My Code I’m Not Fully Confident In

The area I am least confident about is concurrency around session ordering.

Since sessions have positional ordering, concurrent reorder requests from multiple clients could potentially create race conditions. I handled normal reorder flows, but I did not extensively test concurrent updates.

I am also not fully satisfied with bulk import robustness. It works functionally, but I think there is room to improve:

- transaction safety
- retry handling
- duplicate prevention
- detailed row-level error reporting

Another area is S3 cleanup.

If an upload URL is generated but the client never uploads, or uploads partial data, orphaned objects may accumulate over time. I did not implement lifecycle cleanup for abandoned uploads.

Finally, because the backend is written in plain JavaScript instead of TypeScript, some runtime safety is missing. I had to rely more heavily on validation middleware and testing.

---

## What I Would Change With Two More Days

With two more days, I would focus less on adding features and more on hardening the system.

### 1. Migrate Backend to TypeScript

This would improve maintainability and reduce runtime bugs through static typing.

I would add:

- typed request objects
- DTO interfaces
- model typings
- better autocomplete and refactoring safety

### 2. Improve Bulk Import Reliability

I would redesign bulk imports using:

- transactions
- batch IDs
- idempotency keys
- background workers

This would make imports much safer and easier to retry.

### 3. Stronger Tenant Isolation Guarantees

I would reduce reliance on manual filters by introducing stronger enforcement, possibly through:

- centralized query helpers
- PostgreSQL RLS
- policy testing

### 4. Better Test Coverage

Current tests focus heavily on tenant isolation.

I would expand testing for:

- upload authorization
- auth edge cases
- reorder concurrency
- bulk import failures

### 5. Better Observability

I added structured logs and audit logs, but production systems need more.

I would add:

- metrics
- distributed tracing
- error dashboards
- performance monitoring

Overall, I’m happy with the architecture because it balances clarity, functionality, and implementation speed. The system is not production-perfect, but I believe the core design decisions are practical and scalable with targeted improvements.
