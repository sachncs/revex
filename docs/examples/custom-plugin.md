# Custom plugin

Revex is built around a small plugin registry. You can plug in
your own:

- **Retrievers** — additional sources that participate in RRF.
- **Tools** — actions the orchestrator can call mid-loop.
- **Feedback scorers** — re-rankers driven by per-turn feedback.
- **Telemetry adapters** — sinks for spans, counters, and
  gauges.

This page walks through a custom retriever that hits a remote
search API.

## What you need to know

The plugin registry lives in `@revex/core/src/plugins/registry.ts`
and is re-exported as `Registry`:

```ts
import { Registry } from '@revex/core';

Registry.register('retrievers', 'my_custom', myRetriever);
Registry.entries_for('retrievers');
```

The four plugin groups are:

| Group | Use it for |
|---|---|
| `retrievers` | A function returning `Hit[]`. |
| `tools` | Anything the orchestrator can call. |
| `feedback_scorers` | Algorithms that re-rank based on past feedback. |
| `telemetry` | Spans / counters / gauges sinks. |

## A custom retriever

```ts
// src/plugins/serp-retriever.ts
import { Registry, type Hit } from '@revex/core';

interface SerpConfig {
  readonly apiKey: string;
  readonly endpoint: string;
}

const config: SerpConfig = {
  apiKey: process.env['SERP_API_KEY'] ?? '',
  endpoint: 'https://api.serp.example.com/search',
};

interface SerpResponse {
  results: ReadonlyArray<{ title: string; url: string; snippet: string }>;
}

const serpRetrieve = async (
  query: string,
  topK: number,
): Promise<readonly Hit[]> => {
  const res = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({ q: query, limit: topK }),
  });
  if (!res.ok) {
    throw new Error(`SERP ${res.status}`);
  }
  const body = (await res.json()) as SerpResponse;
  return body.results.map((r, i): Hit => ({
    chunk: {
      id: brandId(`web_${i}`),
      workspaceId: brandId('wsp_external'),
      ownerId: brandId('usr_external'),
      collectionId: brandId('col_web'),
      documentId: brandId('doc_web'),
      modality: 'text',
      text: `${r.title}\n${r.snippet}`,
      embedding: [],
      metadata: { url: r.url, source: 'web' },
      tokenCount: 0,
      createdAt: new Date(),
    },
    score: 1 / (i + 1),
  }));
};

Registry.register('retrievers', 'serp', serpRetrieve);
```

The shape matches the `Retrieval` contract — anything returning
`Hit[]` is plug-and-play. Scores are RRF-ready: lower ranks get
lower scores, and `reciprocalRankFusion` blends them with the
dense and BM25 scores.

## Wire it into the orchestrator

The runtime needs to know about the new retriever. In the API,
add the import to `packages/api/src/index.ts`:

```ts
import './plugins/serp-retriever.js';
```

The registry now exposes `'serp'` alongside the built-ins. The
orchestrator picks it up via:

```ts
const result = await hybridSearch({
  workspaceId,
  userId,
  query,
  retrievers: ['vector', 'keyword', 'serp'],
});
```

## A custom telemetry sink

The telemetry surface is the same shape as the others:

```ts
// src/plugins/otel-sink.ts
import { Registry, type Telemetry } from '@revex/core';

class OtelSink implements Telemetry {
  async span(name: string, attrs: Record<string, unknown>) {
    /* …send to OTLP… */
  }
  async counter(name: string, value: number, attrs: Record<string, unknown>) {
    /* …send to OTLP… */
  }
}

Registry.register('telemetry', 'otel', new OtelSink());
```

`createTelemetry('otel')` returns your sink; pass it to the
orchestrator:

```ts
const orchestrator = new Orchestrator({
  telemetry: Registry.lookup<Telemetry>('telemetry', 'otel'),
  /* … */
});
```

## A custom feedback scorer

Scorers are stateful. They re-rank candidates based on past
per-turn feedback:

```ts
import { Registry } from '@revex/core';

class DomainBooster implements FeedbackScorer {
  readonly name = 'domain_boost';
  score(feedback, question, candidates) {
    /* Boost candidates that contain terms from up-voted
     * feedback comments. */
    const upTerms = collectTerms(feedback.filter((f) => f.rating === 'up'));
    return candidates.map((c) => ({
      ...c,
      boost: countHits(c.text, upTerms) * 0.05,
    }));
  }
}

Registry.register('feedback_scorers', 'domain_boost', new DomainBooster());
```

The orchestrator applies the registered scorer after the
retrieval and reranker steps.

## Testing your plugin

Plug a stub into the registry, call it directly:

```ts
import { describe, expect, it } from 'vitest';
import { Registry } from '@revex/core';

describe('serp', () => {
  it('parses SERP hits into Hit[]', async () => {
    const fn = Registry.lookup<(q: string, k: number) => Promise<Hit[]>>('retrievers', 'serp');
    const hits = await fn('foo', 3);
    expect(hits).toHaveLength(3);
    expect(hits[0]?.chunk.metadata['source']).toBe('web');
  });
});
```

The plugin surface is stable; breaking changes are released as
major-version bumps of `@revex/core`.

## What's next

- [Hybrid retrieval](../guide/retrieval.md) — where your custom
  retriever slots into the RRF pipeline.
- [Architecture overview](../architecture/overview.md) — the
  registry sits in `@revex/core/src/plugins/`.
- [Plugins API reference](../reference/api.md#plugins) — every
  plugin group and the contracts they implement.
