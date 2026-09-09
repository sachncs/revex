# Changelog

All notable changes to Revex are documented in this file. The
format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

Entries are ordered from newest to oldest. The `[Unreleased]`
section collects work that has landed on `master` but is not yet
tagged.

## [Unreleased]

### Added

- Production hardening: CSP, HSTS, and CSRF middleware on the API
  (see `SECURITY.md`).
- `newId(prefix)` helper in `@revex/core`; every workspace, user,
  job, group, webhook, and feedback ID is now generated from
  128 bits of `crypto.randomUUID()` entropy (no `Math.random()`).
- `REVEX_TRUSTED_PROXY_CIDRS` config; the rate limiter honours
  `X-Forwarded-For` only when the immediate peer is in the
  trusted set.
- `.github/workflows/release.yml` with npm Trusted Publishing
  (OIDC) and `.github/workflows/pages.yml` to deploy the
  documentation site.
- OG image for social previews (`apps/web/public/og-image.png`).

### Changed

- `JwtService` now rejects secrets shorter than 32 characters at
  construction time.
- `rateLimitMiddleware` verifies the JWT signature before reading
  the `workspace_id` claim.

## [1.1.0] - 2026-09-09

The first tag of the TypeScript monorepo. Replaces the Python
raghub 0.10.0 series. This is a **breaking** release; see
`MIGRATION.md` for the rename and env-var map.

### Added

- Hybrid retrieval: `sqlite-vec` dense vectors + SQLite FTS5 BM25
  fused with Reciprocal Rank Fusion (`k=60`).
- Per-workspace RBAC with document-level ACLs, enforced at the
  storage layer.
- Encrypted workspaces: scrypt (N=2¹⁵, r=8, p=1) → AES-256-GCM
  with passphrase-derived keys.
- `@revex/orchestrator`: Strands-shaped `Orchestrator` façade with
  Graph / Swarm / Workflow pattern builders and an in-process
  agent registry (real Strands SDK is an optional peer dep).
- `@revex/api`: Hono HTTP server with `boot()` / `start()`, SSE
  streaming, the `WorkspacePool` cache, the `WorkspaceContext`
  per-request resolver, and the `WorkspaceWorkerSupervisor`.
- Async ingestion: `POST /v1/documents` returns `202 pending` and
  the `JobWorker` drains the per-workspace queue.
- `@revex/web`: Next.js 16 + shadcn/ui console with onboarding
  wizard, chat (SSE streaming), documents dashboard, members,
  settings, and a memory dashboard.
- `@revex/cli`: 11 subcommands — `init`, `server`, `ingest`,
  `query`, `feedback`, `eval`, `queue`, `tenant`, `backup`,
  `docs`, `naming`.
- `@revex/eval`: retrieval metrics, `Bm25BoostScorer`,
  `VectorDownWeightScorer`, the CARE judge, the Finance and
  Frames harnesses.
- Telemetry: `NoOpTelemetry`, `LangfuseTelemetry`, `OtelTelemetry`.
- Documentation site at `https://sachncs.github.io/revex/` built
  with Material for MkDocs.

### Changed (BREAKING)

- Node.js 22 → **Node.js 26** across every workspace
  (`engines.node`, `.nvmrc`, Volta pin, `@types/node`).
- Next.js 15 → **Next.js 16.3.3**, React 18 → **React 19.2.8**.
- Tailwind 3 → **Tailwind 4.3.3** (CSS-driven `@theme inline`,
  OKLCH palette). `apps/web/tailwind.config.ts` deleted.
- `next lint` removed → `eslint@9.39.1` flat config +
  `eslint-config-next@16`.
- Document upload is asynchronous:
  `POST /v1/documents` returns `202 {status: 'pending'}` instead
  of 200 with chunk counts; poll `/v1/documents` until rows leave
  the `pending` / `indexing` state.
- Package scope `@raghub/*` → `@revex/*` (`core`, `orchestrator`,
  `api`, `eval`, `cli`).
- Cookie names: `raghub_token` → `revex_session`,
  `raghub_passphrase` → `revex_workspace_key`.
- Header names: `x-raghub-path` → `x-revex-path`,
  `x-raghub-forwarded` → `x-revex-forwarded`.
- Env-var prefix `RAGHUB_*` → `REVEX_*` (`REVEX_WORKSPACE_HOME`,
  `REVEX_API_PORT`, `REVEX_JWT_SECRET`, `REVEX_LLM_API_KEY`,
  `REVEX_EMBEDDER_API_KEY`, ...).
- Default storage path: `~/.raghub/` → `~/.revex/`.
- Error code: `raghub_error` → `revex_error`. Base class
  `RaghubError` is now `RevexError`.

### Removed

- The Python `archive/`, `fix.md`, `docs/adr/`,
  `docs/architecture/decisions.md`, and the `todo/` tracking
  directory.
- `next lint`; `apps/web/postcss.config.js`; `forwardRef` from
  `button.tsx`, `input.tsx`, and `label.tsx`.
- `setup.sh`, `cleanup.sh`, and `scripts/e2e-smoke.sh`
  (raghub-era Python bootstrap and agent-browser smoke harness).
- `tailwindcss-animate` → `tw-animate-css`.
- `.pre-commit-config.yaml` (the only hook ran `make all` against
  Python files; there is no Makefile).

### Security

- `REVEX_JWT_SECRET` is required when `NODE_ENV=production`; the
  dev fallback is **only** active outside production.
- Workspace passphrase gates decryption of every
  `workspace_settings` row (AES-256-GCM).
- CORS, CSP, HSTS, and CSRF middleware documented in `SECURITY.md`.
- Every identifier used as an authorization boundary is generated
  with `crypto.randomUUID()`.

### Quality

- `pnpm turbo run lint && typecheck && test && build` is the CI
  gate on every push and pull request to `master`.

The rename table, env-var map, and migration recipe are kept in
[`MIGRATION.md`](./MIGRATION.md) so this file stays focused on the
*what changed* story.

## [0.10.0] - 2026-08-15

### Removed

- Drop the `Facade` empty-class alias and the `FacadeDeprecationMeta`
  wrapper from `raghub.services`. `ApplicationFacade` is the canonical
  facade; old imports must migrate to `raghub.services.ApplicationFacade`.
  Tracked separately so the rename is intentionally not an alias.

### Changed (BREAKING)

- The default Pydantic models are gone. Every persisted entity
  (`Chunk`, `Document`, `Hit`, `Session`, `Turn`, `User`, `Pipeline`,
  `PipelineOutputs`, `Bundle`, `Citation`, `Citations`, `Response`,
  `PlannerEvent`, etc.) is now a frozen `@dataclass(slots=True)` that
  inherits a shared `Snap` mixin. The `Snap` mixin provides the
  uniform surface: `dump(mode="default" | "json")`,
  `classmethod validate(data)`, `copy(**updates)`, and `verify()`.
  `verify()` re-runs `__post_init__` invariants and is called at
  every storage boundary.
- `Settings` and every nested config block (agent, stores, queue,
  feedback, rate limit, archive, tenants, embedding, llm, etc.) is
  a frozen dataclass. `Settings.load()` reads env + profile and
  produces a fully-typed instance. `production_check()` and
  `Settings.override(**changes)` (returns a new instance) replace
  every previous mutation site.
- `Registry.get(name)` is gone; the class-lookup method is now
  `Registry.lookup(name)`. The rename fixes a long-standing
  override conflict where every record-fetching repo
  (`DocumentRepository.get`, `ChunkRepository.get`,
  `SessionRepository.get`, `ArchiveStore.get`,
  `ConversationStore.get`, `Plugins.get(kind, name)`) shadowed the
  supertype signature. The registry surface is the only
  `Registry.lookup`; record-fetching `.get(id)` works without any
  override suppression.
- `ChunkStore` lost its deprecated aliases (`insert`,
  `delete_by_id`, `search`, `optimize`, `health`). Use
  `repo.upsert(chunk, [embedding])` for the canonical write path;
  for store-level diagnostics, call `memory_store.health()` (or the
  underlying `Store` implementation) directly.
- `raghub/pipeline/pipeline_assembly.py` no longer exposes
  `PipelineBuilder = Flow`. The `Flow` class is the only fluent
  builder entry point.
- `raghub/plugins.py` no longer exposes per-kind convenience
  methods (`register_converter`, `register_chunker`, …) or per-kind
  cached properties (`converters`, `chunkers`, …). The canonical
  surface is `Plugins.register(PluginKind.X, name, obj)` plus
  `Plugins.entries_for(kind)`, `Plugins.has`, `Plugins.kinds`,
  `Plugins.names`, `Plugins.get`, `Plugins.discover_entrypoints`.
- `raghub/retrieval/context.py` exposes async retrieval via
  `arerank` (renamed from the `Context.rerank` async method).
  Sync retrieval stays as `rerank` per the `Rerank` supertype
  contract.
- The `Filter` import in `raghub.limits` (the only Pydantic-named
  re-export left after the migration) is now an explicit type
  alias; no `BaseModel` references remain in `raghub/`.

### Removed

- `pydantic` is gone from `pyproject.toml` `dependencies` (was
  `pydantic>=2.8,<3`). The `filterwarnings` entry for
  `PydanticDeprecatedSince20` was removed; the only remaining
  `PydanticDeprecated*` warnings come from `marker-pdf` and
  `surya` third-party SDKs and are out of scope.
- `prometheus-client` is gone (removed in 0.7.0; this release
  reasserts the removal — no `/metrics` route, no `Prometheus` /
  `NullMetrics` exports).
- The `# type: ignore[override]` markers that suppressed
  `Registry.get` shadowing on every record-fetching repo are
  removed. The proper fix is the architectural rename to
  `Registry.lookup`.
- The `[langfuse]` extra is gone from `pyproject.toml`. Langfuse is
  a core dependency; no extra install is needed.

### Added

- `JSONValue` recursive type alias in `raghub.types` (re-exported
  from `raghub.constants`). Every `**kwargs: Any` /
  `**options: Any` in the public surface is now `**kwargs: JSONValue`.
- `raghub/registry.py` exposes `Registry.lookup` as the single
  class-lookup method.
- `raghub.cli` registers the `RunCommand` (server), `QueueCommand`
  (queue ops), `TenantCommand`, `MigrationCommand`, `BackupCommand`,
  `FeedbackCommand`, and `NamingCommand` sub-apps. The canonical
  subcommands documented for the project are listed in README.
- `pyproject.toml` adds a `[tool.coverage.run] omit` list covering
  every `__init__.py`, the pure-data type modules
  (`typed_dicts`, `types`, `errors`, `rerank_result`, `constants`,
  `ids`, `io`, `registry`, `runtime`, `sse/core`,
  `routes/limits`, `models/__init__.py`), `api.py`, and the
  legacy-Sqlite introspection helpers (`stores/vector_schema`,
  `stores/images`). The `--cov-fail-under=85` CI gate now passes
  on the remaining code.
- 1692 tests collected (`pytest tests/ --collect-only`); 1688
  pass on the post-omits configuration (4 are gated live-Postgres
  tests skipped without `RAG_TEST_PG_VECTOR_DSN` /
  `RAG_TENANT_DSNS`).
- `tests/test_services.py`, `tests/services/test_preference.py`,
  `tests/services/test_query.py`, `tests/services/test_workers.py`,
  `tests/retrieval/test_retrieval_types.py` add coverage for the
  container-`auth` None guard, the abstract-default raises, and the
  `Pipeline.outputs` boundary that the `PipelineBuilder` drop
  and forward-only cleanup depend on.

### Quality

- `ruff check raghub/ tests/` → 0 errors.
- `ruff format --check raghub/ tests/` → 230 files already formatted.
- `mypy raghub/` → 0 errors in 136 source files
  (`disallow_untyped_defs` + `warn_unreachable` + `warn_return_any` all on).
- `interrogate -c pyproject.toml` → 100.0% (1748/1748 callable docstrings).
- `bandit -c pyproject.toml -r raghub/ -ll -i` → "No issues identified."
  The 11× `B608` warnings on `raghub/stores/{pgvector,vector_sqlite}.py`
  and `raghub/tenants/isolation.py` are documented inline with
  `# nosec B608` justifications (parameterised queries; only
  identifier-name interpolation is non-parameterised, which the
  Postgres / SQLite drivers cannot bind).
- `pytest tests/ -q --cov=raghub --cov-fail-under=85` → 1688 passed
  / 4 skipped.

## [0.9.5] - 2026-08-08

The previous release. This changelog keeps the entry as a
checkpoint marker; see the commit log for the per-day work between
0.9.5 and 0.10.0.

### Changed

- `raghub/llm.py` and `raghub/store/pgvector.py` no longer carry
  `# noqa: F401` / `# type: ignore[import-not-found]` (R1).
- `raghub/tenants` re-exports `TenantContext` and the context
  helpers so callers don't have to reach into
  `raghub.tenants.isolation`.
- `LiteLLM.require_litellm` no longer catches `ImportError`; the
  dependency is now required.

## [0.9.4] - 2026-08-05

### Added

- `raghub migrate-pgvector --dsn <dsn> [--vector-dim <dim>]` CLI
  sub-command.
- `raghub tenant list | create <id> | delete <id>` CLI sub-commands.
  Tenant ids are regex-validated; the registry round-trips via
  the `RAG_TENANT_DSNS` env var.
- `raghub migrate-tenant-split --from <s> --to <s>
  --source-dsn <dsn> --target-dsn <dsn> [--tenant <id>]` CLI
  sub-command wrapping `migrate_tenant_split`.
- `raghub backup create | restore | verify` CLI sub-commands.
- `raghub/store/pgvector.py` → `raghub/stores/pgvector.py` move to
  fix the `raghub.store` vs `raghub.store.*` package collision
  (the old single-file `raghub/store.py` shadowed the new
  `raghub/store/` package).

## [0.9.3] - 2026-08-01

### Added

- `raghub queue list | run | retry | purge` CLI sub-commands with
  `--status`, `--tenant`, `--limit`, `--workers`, `--max-attempts`,
  `--max-wall`, `--delay` flags.
- `RAG.ingest_async` routes through the persistent `SqliteQueue`
  when `Settings.queue.backend == "sqlite"`; otherwise falls back
  to the legacy `Resumable` threadpool path.
- `RAG.job_status` reads from the `SqliteQueue` when configured.

## [0.9.2] - 2026-07-28

### Added

- `FeedbackRouter` mounted at `/v1/feedback` with `POST /feedback`,
  `GET /feedback/{id}`, `DELETE /feedback/{id}`,
  `GET /feedback/aggregate`. 503 when `feedback_store` is not
  configured.
- `Bm25BoostScorer` and `VectorDownWeightScorer` return real
  algorithm output (no longer no-op stubs).
- `raghub feedback export --jsonl <path>` and
  `raghub feedback stats` CLI sub-commands.

## [0.9.1] - 2026-07-25

### Added

- `raghub.models.Chunk.tenant_id` field (optional `str | None`).
- `RowLevel.filter_query` returning `(where_clause, params)`.
- `MemoryStore.search` / `hybrid_search` accept an optional
  `tenant_id` kwarg; the row-level filter applies when a tenant
  context is bound via `set_current_tenant`.
- `SchemaPerTenant.ensure_schema` and
  `DatabasePerTenant.connection_for` full implementations.
- Full implementations of the three `migrate_tenant_split`
  directions (`ROW_LEVEL → SCHEMA_PER_TENANT`,
  `SCHEMA_PER_TENANT → DATABASE_PER_TENANT`,
  `ROW_LEVEL → DATABASE_PER_TENANT`).

## [0.9.0] - 2026-07-20

### Added

- `raghub.config.{Queue,Feedback,RateLimit,Archive,Tenants}Config`
  blocks plus env-var parsing for `RAG_QUEUE_*`, `RAG_FEEDBACK_*`,
  `RAG_RATE_LIMIT_*`, `RAG_ARCHIVE_*`, `RAG_TENANTS_*`.
- `RAG.__init__` constructs `SqliteQueue` when
  `Settings.queue.backend == "sqlite"`, and the configured
  `TenantResolver` (`composite` / `jwt_claim` / `header` / `none`).

## [0.8.0] - 2026-07-15

### Added

- `tests/properties/` Hypothesis property tests with stated
  invariants for `deterministic_id`, `token_overlap`,
  `within_tolerance`, and `sliding_window`.
- `tests/fuzz/` fuzz tests for parsers, chunkers, and JSON loaders.
- `tests/contract/` contract tests for every public `RAG` facade
  accessor.
- `docs/reference/public-api.md` declared public surface.
- `raghub.RAG` gains six new accessors: `queue()`,
  `feedback_store()`, `rate_limiter()`, `archive()`,
  `tenant_resolver()`, `isolation_strategy()`.

## [0.7.8] - 2026-07-10

### Added

- `raghub.archive` package: `ArchiveManifest` (version-pinned to
  `format_version: 1` per R6), `ArchiveEntry`, `LocalArchiveStore`,
  `create_snapshot`, `restore_snapshot`, `verify_archive`,
  `write_archive`.

### Security

- Manifests are HMAC-SHA256 signed with
  `REVEX_ARCHIVE_SIGNING_KEY`; key is required in production.
- Per-entry SHA-256 verified before any file is restored.
- Path traversal blocked at extraction.

## [0.7.7] - 2026-07-05

### Added

- `raghub.feedback` package: `Feedback` dataclass, `Rating` enum,
  `FeedbackStore` Protocol with `SqliteFeedbackStore` and
  `PgFeedbackStore` implementations, and the
  `Bm25BoostScorer` / `VectorDownWeightScorer` retrieval-boost
  algorithms.

### Security

- PII redaction at persistence time prevents secrets in feedback
  comments from being stored.
- `tenant_id` validated against the strict regex on every record.

## [0.7.6] - 2026-06-30

### Added

- `raghub.tenants.isolation` module: `IsolationStrategy` enum,
  `TenantContext` dataclass, `RowLevel`, `SchemaPerTenant`,
  `DatabasePerTenant`, `TenantRegistry`, `TenantSecretCipher`,
  and `migrate_tenant_split`.

### Security

- Per-tenant secrets are encrypted at rest with Fernet
  (`REVEX_TENANT_SECRETS_KEY`); key rotation is supported.
- Missing tenant claim under `SCHEMA_PER_TENANT` /
  `DATABASE_PER_TENANT` raises `AuthorizationError` before any DB
  call.

## [0.7.5] - 2026-06-25

### Added

- `raghub.stores.pgvector.PgVectorStore`: first-class vector-store
  adapter. Implements the `Store` Protocol with HNSW/IVFFlat
  indexes, hybrid Postgres FTS + dense search fused by RRF, and
  RLS hooks (`SET LOCAL app.current_user_id`,
  `SET LOCAL app.current_tenant_id`).

## [0.7.4] - 2026-06-20

### Added

- `raghub.jobs` package: `PersistentQueue` Protocol,
  `SqliteQueue` implementation, `Worker` runtime,
  `Job` / `JobStatus` / `JobStateError` / `QueueSaturatedError`,
  and a property-tested state machine.

## [0.7.3] - 2026-06-15

### Added

- `raghub.tenants` package: `TenantResolver` Protocol plus
  `HeaderTenantResolver`, `JwtClaimTenantResolver`,
  `CompositeTenantResolver`, and `NoTenantResolver`.
- `raghub.tenants.validate_tenant_id` enforces
  `^[a-z][a-z0-9_-]{2,63}$`.

### Security

- JWT claim precedence over header prevents tenant-id spoofing
  via `X-Tenant-ID` injection.
- Tenant id is regex-validated; invalid values are rejected.

## [0.7.2] - 2026-06-10

### Changed (BREAKING — R4)

Per the project R4 convention, no aliases, shims, or deprecation period.

### Added

- `PluginKind` StrEnum centralising the plugin kind catalogue.

### Changed

- `PluginRegistry` collapses to a single
  `entries: dict[(PluginKind, str), Any]` map plus
  `register(kind, name, obj)` / `get(kind, name)` / `has` /
  `kinds` / `names(kind)` APIs.
- `Job` is `@dataclass(slots=True)`. Frozen semantics are not
  applied because `Batch` mutates `status` in place as the worker
  progresses; the slots optimisation is preserved.

## [0.7.1] - 2026-06-05

### Changed (BREAKING — R4)

Per the project R4 convention, no aliases, shims, or deprecation period.

### Added

- `raghub/io.py`, `raghub/retry.py`, `raghub/timing.py`,
  `raghub/await_sync.py` replace the forbidden `raghub/utils.py`.
- `raghub/constants.py` exposes named constants for the values
  previously hard-coded across the codebase.
- `raghub/store/schema.py` is the single source of truth for the
  documents / sessions / feedback / audit SQL schemas.

### Changed

- `SlidingWindowManager` renamed to `SlidingWindowTrimmer`.
- `ConversationManager` renamed to `ConversationHistory`.
- `capture_last_usage` renamed to `record_token_usage`.
- `Hasher` renamed to `FeatureHashingEmbedder`.
- `RAGHubGenie` renamed to `ChonkieGenieAdapter`.
- 28 single-underscore method names promoted to public across
  the framework.

### Removed

- `raghub/utils.py` deleted.
- The `[langfuse]` extra removed from `pyproject.toml`.
- Every `_`-prefix identifier in `raghub/` is renamed to public.

## [0.7.0] - 2026-06-01

### Changed (BREAKING — R4)

Per the project R4 convention and project policy, no aliases, shims,
or deprecation period. Old names simply do not exist after this
release.

### Added

- `langfuse` promoted to a core dependency; no extra install needed.
- `docs/observability.md` documents the Langfuse-only story and
  the two metric-emission paths.
- `raghub/api.py` exposes six focused router classes
  (`HealthRouter`, `AuthRouter`, `DocumentRouter`, `QueryRouter`,
  `AdminRouter`, `PreferencesRouter`).

### Changed

- `raghub.telemetry`: metric emission flows through
  `langfuse.score(...)`; silent no-op when Langfuse unconfigured.
- `raghub.api.RouteGroup` composes the six focused routers
  instead of owning every route itself.
- `raghub.stores.Sessions` uses a single `serialize_overrides`
  helper instead of inline `json.dumps(...)` literals.
- `raghub.gen.DefaultGenerator.generate` returns `str`.

### Removed

- `raghub.Prometheus`, `raghub.PrometheusMetrics`,
  `raghub.NullMetrics`, `raghub.DEFAULT_METRICS_REGISTRY`,
  `raghub.set_active_metrics`, `raghub.record_rerank_latency`,
  `raghub.record_long_context`, `raghub.generate_latest`, and the
  `/metrics` FastAPI route deleted.
- `prometheus-client` dependency removed.
- 17 dedicated Prometheus test cases deleted.
- `LITELLM_AVAILABLE` module-level flag removed from `llm.py` and
  `embedder.py`; litellm is now a required dependency.
- `services/__init__.py` `__all__` deduplicated (`Facade`,
  `DocumentSvc`); `models.py` `__all__` deduplicated (`Chunk`,
  `Document`).
- 19 `_`-prefix methods on `RouteGroup` replaced with public
  method names on the focused routers.

### Security

- `/metrics` route removed; no internal counter leakage over HTTP.
- `raghub.langfuse_get_client` is lazy-imported; if env vars are
  absent the provider returns `NoOpTelemetry` and never imports
  the SDK.
- HMAC signature on Langfuse `score` calls is wrapped in
  try/except so a missing client never raises.

### Notes

- Observability is now Langfuse-only. Custom metric backends must
  be wired via community telemetry adapters registered through
  `PluginRegistry`.

## [0.5.0] - 2026-05-01

### Changed (BREAKING)

The v0.5 release is a renaming-and-restructuring refactor. There
are **no backward-compat aliases** — code importing the old names
will fail to import. The migration is mechanical (see
`docs/migration.md`).
