# Error codes

Every error in `@revex/core` extends `RevexError` and carries a
stable string `code`. The API maps each code to an HTTP status
via `errorMiddleware`; the CLI surfaces the same code in its
output.

## HTTP status mapping

| Code | HTTP status | Meaning |
|---|:---:|---|
| `auth_error` | 401 | Missing or invalid bearer token. |
| `authorization_error` | 403 | Authenticated but lacks the required role / scope. |
| `configuration_error` | 500 | Server-side misconfiguration (missing env var, bad JWT secret). |
| `verification_error` | 400 | Domain invariant failure on a record read or write. |
| `generation_error` | 502 | LLM provider returned an error or invalid output. |
| `ingestion_error` | 400 | Bad input to an ingestion route (missing file, bad mime). |
| `pipeline_error` | 500 | Internal pipeline failure (orchestrator or agent runtime). |
| `retrieval_error` | 502 | Retrieval backend failure (sqlite-vec, FTS5, remote search). |
| `vector_store_error` | 500 | Vector store operation failure. |
| `missing_dependency` | 500 | A required dependency is not loaded. |
| `revex_error` (default) | 500 | Uncategorised error. |
| `csrf_rejected` | 403 | CSRF middleware rejected the request (missing or mismatched `Origin`). |
| `rate_limit` | 429 | Rate-limit middleware exceeded the per-IP or per-workspace bucket. |

## Error envelope

Every error response has the same shape:

```json
{
  "error": {
    "code": "auth_error",
    "message": "invalid or expired token",
    "details": {
      "tokenExpiredAt": "2026-09-09T12:34:56.000Z"
    }
  }
}
```

`details` is optional and code-specific.

## Programmatic access

The `classifyError(code)` helper turns a string code back into
the concrete `RevexError` subclass:

```ts
import { classifyError, AuthError } from '@revex/core';

const err = classifyError('auth_error');
if (err instanceof AuthError) {
  // handle specifically
}
```

The full class hierarchy:

```text
RevexError
├── AuthError               code: auth_error
├── AuthorizationError      code: authorization_error
├── ConfigurationError      code: configuration_error
├── VerificationError       code: verification_error
├── GenerationError         code: generation_error
├── IngestionError          code: ingestion_error
├── PipelineError           code: pipeline_error
├── RetrievalError          code: retrieval_error
├── VectorStoreError        code: vector_store_error
└── MissingDepError         code: missing_dependency
```

## Client-side handling

The web console surfaces errors inline in the chat trace and
shows a toast for terminal errors. The CLI prints the error
code and message and exits non-zero:

```bash
$ revex query "what is the capital of France?"
auth_error: invalid or expired token
$ echo $?
1
```

## Adding a new error code

1. Add the code as a `const` in `packages/core/src/errors/index.ts`.
2. Add the class to the `RevexError` subclass tree.
3. Update the `errorMiddleware` table in
   `packages/api/src/middleware/error.ts` to map the code to
   the correct HTTP status.
4. Add a row to this page so the documentation stays in sync.

The contract is stable: an error code returned in one release
will not be renumbered in a minor or patch release.
