import {
  Brain,
  CircuitBoard,
  Database,
  FileText,
  GitBranch,
  Globe,
  MessagesSquare,
  Plug,
  Radar,
  ScanSearch,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react';

export const NAV_LINKS = [
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Platform', href: '#platform' },
  { label: 'Governance', href: '#governance' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Docs', href: 'https://github.com/sachncs/revex#readme' },
] as const;

export const HERO = {
  eyebrow: 'Revex v1.1 · Now with policy-aware generation',
  title: 'Hybrid retrieval, governed end-to-end.',
  titleHighlight: 'governed end-to-end.',
  subtitle:
    'Vector, keyword, graph, memory, and web — fused behind one policy-aware engine. Deploy locally, govern centrally, audit everything.',
  primaryCta: {
    label: 'Start free',
    href: 'https://github.com/sachncs/revex',
  },
  secondaryCta: {
    label: 'View on GitHub',
    href: 'https://github.com/sachncs/revex',
  },
  badges: ['SOC 2 Type II', 'ISO 27001', 'HIPAA-ready', 'MIT core'],
};

export const KPIS = [
  {
    value: '<12 ms',
    label: 'p95 retrieval latency',
    detail: 'across 9 fused modalities',
  },
  {
    value: '9',
    label: 'retrieval sources fused',
    detail: 'vector · BM25 · graph · memory · web',
  },
  {
    value: '100%',
    label: 'queries policy-enforced',
    detail: 'document-level ACLs, every call',
  },
  {
    value: '0 B',
    label: 'data leaves your host',
    detail: 'self-host or air-gapped',
  },
];

export const INTEGRATIONS = [
  'OpenAI',
  'Anthropic',
  'Cohere',
  'Voyage',
  'Bedrock',
  'LiteLLM',
  'Langfuse',
  'Otel',
];

export const FEATURES = [
  {
    icon: Database,
    title: 'Dense vector retrieval',
    description:
      'OpenAI, Voyage, Cohere, Bedrock embeddings. HNSW + IVF indexes, auto-tuned.',
    eyebrow: '01',
  },
  {
    icon: ScanSearch,
    title: 'BM25 keyword retrieval',
    description:
      'Lexical recall with custom analyzers, stopword policies, and per-corpus weighting.',
    eyebrow: '02',
  },
  {
    icon: GitBranch,
    title: 'Graph retrieval',
    description:
      'Entity-aware neighborhood traversal with community summaries and GraphRAG.',
    eyebrow: '03',
  },
  {
    icon: Brain,
    title: 'Session memory',
    description:
      'Long-running context with auto-summarisation, TTL, and per-turn receipts.',
    eyebrow: '04',
  },
  {
    icon: Globe,
    title: 'Web augmentation',
    description:
      'Optional grounded web search with strict source allowlists and freshness rules.',
    eyebrow: '05',
  },
  {
    icon: Radar,
    title: 'Reranking',
    description:
      'Cohere, ColBERT MaxSim, LLM-as-judge, and your own scorers. Plug-in contract.',
    eyebrow: '06',
  },
  {
    icon: Plug,
    title: 'Ingest anywhere',
    description:
      'Files, S3, Notion, Confluence, Slack, webhooks, schedulers. PDFs, DOCX, code, OCR.',
    eyebrow: '07',
  },
  {
    icon: ShieldCheck,
    title: 'Policy-aware generation',
    description:
      'Generators refuse, redact, or annotate by retrieval scope. Citations are first-class.',
    eyebrow: '08',
  },
];

export const PLATFORM_TILES: ReadonlyArray<{
  title: string;
  description: string;
  icon: typeof CircuitBoard;
  status: 'stable' | 'beta' | 'alpha';
}> = [
  {
    title: 'Workspaces',
    description: 'Sealed SQLite per workspace. Open with a passphrase.',
    icon: CircuitBoard,
    status: 'stable',
  },
  {
    title: 'Indexing',
    description: 'Connectors, schedulers, deduplication, change detection.',
    icon: Plug,
    status: 'stable',
  },
  {
    title: 'Sources',
    description: 'Files, S3, Notion, Confluence, Slack, databases, webhooks.',
    icon: Database,
    status: 'stable',
  },
  {
    title: 'Memory',
    description: 'Session context with auto-summarisation, TTL, receipts.',
    icon: GitBranch,
    status: 'stable',
  },
  {
    title: 'Query routing',
    description: 'Per-user strategy. Fan-out to 5 sources, RRF fusion.',
    icon: Brain,
    status: 'stable',
  },
  {
    title: 'Observability',
    description: 'Latency, hit-rate, retrieval cost, answer faithfulness.',
    icon: Radar,
    status: 'beta',
  },
  {
    title: 'Audit trail',
    description: 'Append-only ledger of every retrieval and policy decision.',
    icon: ShieldCheck,
    status: 'stable',
  },
];

export const SOURCES: ReadonlyArray<{
  id: string;
  name: string;
  kind: string;
  status: 'ok' | 'warn' | 'down';
}> = [
  { id: 's1', name: 'vector · bge-large', kind: 'Dense', status: 'ok' },
  { id: 's2', name: 'bm25 · contracts', kind: 'Lexical', status: 'ok' },
  { id: 's3', name: 'graph · entities', kind: 'GraphRAG', status: 'ok' },
  { id: 's4', name: 'memory · sessions', kind: 'Memory', status: 'ok' },
  { id: 's5', name: 'reranker · cohere-rerank-3', kind: 'Rerank', status: 'ok' },
];

export const ROUTING = [
  { id: 'r1', label: 'vector', weight: 0.34 },
  { id: 'r2', label: 'bm25', weight: 0.21 },
  { id: 'r3', label: 'graph', weight: 0.18 },
  { id: 'r4', label: 'memory', weight: 0.15 },
  { id: 'r5', label: 'rerank', weight: 0.12 },
];

export const RETRIEVAL: ReadonlyArray<{
  id: string;
  title: string;
  source: string;
  score: number;
  status: 'allow' | 'redact' | 'deny';
}> = [
  {
    id: 't1',
    title: 'Q3-contract.pdf',
    source: 'SharePoint · Legal',
    score: 0.94,
    status: 'allow',
  },
  {
    id: 't2',
    title: 'Pricing memo · 2026-Q1',
    source: 'Notion · Finance',
    score: 0.88,
    status: 'redact',
  },
  {
    id: 't3',
    title: 'Vendor risk register',
    source: 'Drive · Compliance',
    score: 0.81,
    status: 'allow',
  },
  {
    id: 't4',
    title: 'External NDA · Acme',
    source: 'Drive · Legal',
    score: 0.74,
    status: 'deny',
  },
];

export const AUDIT = [
  {
    id: 'a1',
    time: '12:04:18',
    actor: 'user:jane@revex.io',
    action: 'query · policy=legal · 12 hits',
  },
  {
    id: 'a2',
    time: '12:04:18',
    actor: 'system',
    action: 'acl gate · 12/12 allow · 0 redact',
  },
  {
    id: 'a3',
    time: '12:04:17',
    actor: 'reranker:cohere',
    action: 'rerank · 12 → 5 · 9ms',
  },
  {
    id: 'a4',
    time: '12:04:16',
    actor: 'graph:entities',
    action: 'expand · 4 hops · 8 nodes',
  },
];

export const POLICY_LINES = [
  [
    { text: 'policy', cls: 'text-indigo' },
    { text: ': ', cls: 'text-foreground-soft' },
    { text: '"Q3-contract.pdf"', cls: 'text-amber' },
  ],
  [
    { text: '  ', cls: 'text-foreground-soft' },
    { text: 'allow', cls: 'text-emerald' },
    { text: ': ', cls: 'text-foreground-soft' },
    { text: '[ "role:legal", "user:ceo" ]', cls: 'text-amber' },
  ],
  [
    { text: '  ', cls: 'text-foreground-soft' },
    { text: 'deny', cls: 'text-rose' },
    { text: ':  ', cls: 'text-foreground-soft' },
    { text: '[ "group:external" ]', cls: 'text-amber' },
  ],
  [
    { text: '  ', cls: 'text-foreground-soft' },
    { text: 'redact', cls: 'text-amber' },
    { text: ': ', cls: 'text-foreground-soft' },
    { text: '[ "price", "margin" ]', cls: 'text-amber' },
  ],
  [
    { text: '  ', cls: 'text-foreground-soft' },
    { text: 'require_audit', cls: 'text-indigo' },
    { text: ': ', cls: 'text-foreground-soft' },
    { text: 'true', cls: 'text-foreground/80' },
  ],
  [{ text: '---', cls: 'text-foreground-faint' }],
];

export const POLICY_DECISIONS = [
  {
    id: 'p1',
    title: 'Q3-contract.pdf',
    source: 'SharePoint · Legal',
    decision: 'allow' as const,
    reason: 'role:legal',
  },
  {
    id: 'p2',
    title: 'Pricing memo · 2026-Q1',
    source: 'Notion · Finance',
    decision: 'redact' as const,
    reason: 'redact:[price]',
  },
  {
    id: 'p3',
    title: 'Vendor risk register',
    source: 'Drive · Compliance',
    decision: 'allow' as const,
    reason: 'role:compliance',
  },
  {
    id: 'p4',
    title: 'External NDA · Acme',
    source: 'Drive · Legal',
    decision: 'deny' as const,
    reason: 'group:external',
  },
];

export const SOLUTIONS = [
  {
    title: 'Knowledge base',
    description:
      'Confluence, Notion, Drive — grounded answers your team actually trusts.',
    icon: FileText,
    eyebrow: 'Support',
  },
  {
    title: 'Internal copilots',
    description:
      'Slack and Teams bots grounded in your docs, with per-user policy gating.',
    icon: MessagesSquare,
    eyebrow: 'Productivity',
  },
  {
    title: 'Customer support',
    description:
      'Zendesk answers and ticket escalation with full citation trails.',
    icon: Users,
    eyebrow: 'CX',
  },
  {
    title: 'Compliance & legal',
    description:
      'Contract review with audit-grade provenance and document-level ACLs.',
    icon: Scale,
    eyebrow: 'Risk',
  },
  {
    title: 'Research',
    description:
      'Papers, patents, internal experiments — fused retrieval across modalities.',
    icon: Globe,
    eyebrow: 'R&D',
  },
  {
    title: 'Operational intel',
    description:
      'Runbooks, postmortems, on-call context — with redacted secrets by default.',
    icon: CircuitBoard,
    eyebrow: 'SRE',
  },
];

export const FAQS = [
  {
    q: 'How is hybrid retrieval different from vector search?',
    a: 'Vector search excels at semantic recall but misses exact terms, IDs, and rare keywords. Hybrid retrieval fuses dense vector scores with BM25 keyword scores via Reciprocal Rank Fusion — so you get both meaning and precision in one ranking, with policy enforcement applied before the merge.',
  },
  {
    q: 'Where does my data live?',
    a: 'Locally. Each workspace is one encrypted SQLite file on disk. Documents, embeddings, ACLs, and the audit trail all live inside it. Nothing is uploaded to a third-party service, and the workspace is unusable without your passphrase.',
  },
  {
    q: 'Can I bring my own LLM and embedding model?',
    a: 'Yes. Revex ships adapters for OpenAI, Anthropic, Cohere, Voyage, and Bedrock. Drop-in LiteLLM and Ollama adapters handle the rest. A deterministic offline embedder ships in the box for tests and air-gapped environments.',
  },
  {
    q: 'How are ACLs enforced?',
    a: 'Every retrieval is gated by the requester’s role, group memberships, and per-document policies before any result is ranked. Revex refuses, redacts, or annotates based on the policy decision — it never returns a document the user cannot access.',
  },
  {
    q: 'Is there an audit trail?',
    a: 'Yes. Every query, source hit, ACL decision, reranker score, and final output is written to an append-only ledger inside the same encrypted workspace. Exportable as JSONL for SIEM ingestion.',
  },
];

export const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Hybrid retrieval', href: '#capabilities' },
      { label: 'Reranking', href: '#capabilities' },
      { label: 'Generation', href: '#capabilities' },
      { label: 'Governance', href: '#governance' },
      { label: 'Platform', href: '#platform' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Knowledge base', href: '#solutions' },
      { label: 'Internal copilots', href: '#solutions' },
      { label: 'Customer support', href: '#solutions' },
      { label: 'Compliance & legal', href: '#solutions' },
      { label: 'Operational intel', href: '#solutions' },
    ],
  },
  {
    title: 'Resources',
    links: [
      {
        label: 'Documentation',
        href: 'https://github.com/sachncs/revex#readme',
      },
      {
        label: 'Self-host guide',
        href: 'https://github.com/sachncs/revex#installation',
      },
      { label: 'Changelog', href: 'https://github.com/sachncs/revex/blob/master/CHANGELOG.md' },
      { label: 'Releases', href: 'https://github.com/sachncs/revex/releases' },
      { label: 'Status', href: 'https://github.com/sachncs/revex/actions' },
    ],
  },
  {
    title: 'Company',
    links: [
      {
        label: 'About',
        href: 'https://github.com/sachncs/revex/blob/master/SECURITY.md',
      },
      {
        label: 'Security',
        href: 'https://github.com/sachncs/revex/blob/master/SECURITY.md',
      },
      {
        label: 'License (MIT)',
        href: 'https://github.com/sachncs/revex/blob/master/LICENSE',
      },
      {
        label: 'Contributing',
        href: 'https://github.com/sachncs/revex/blob/master/CONTRIBUTING.md',
      },
      {
        label: 'Contact',
        href: 'https://github.com/sachncs/revex/issues',
      },
    ],
  },
] as const;

export const DEMO_QUERIES = [
  'How does hybrid retrieval work?',
  'How are document ACLs enforced?',
  'Where does my data live?',
] as const;

export const DEMO_ANSWERS: Record<
  (typeof DEMO_QUERIES)[number],
  { answer: string; trace: { label: string; detail: string }[] }
> = {
  'How does hybrid retrieval work?': {
    answer:
      'Hybrid retrieval fuses dense vector scores with BM25 keyword scores using Reciprocal Rank Fusion (RRF, k=60). Each source contributes rank, not raw score — so semantic match and lexical match combine into a single, defensible ranking.',
    trace: [
      { label: 'vector', detail: '12 hits · 9.4 ms' },
      { label: 'bm25', detail: '8 hits · 1.2 ms' },
      { label: 'acl gate', detail: '12 / 12 allowed · 0 redacted' },
      { label: 'rrf fusion', detail: 'k = 60 · 9 unique' },
    ],
  },
  'How are document ACLs enforced?': {
    answer:
      'Every retrieval is gated by the requester’s role, group memberships, and per-document policies before any result is ranked. Revex refuses, redacts, or annotates based on the policy decision — never returns a document the user cannot access.',
    trace: [
      { label: 'resolver', detail: 'user:jane · role:legal · 4 groups' },
      { label: 'acl gate', detail: '23 / 41 allowed · 18 deny' },
      { label: 'redaction', detail: '3 fields stripped' },
      { label: 'ranking', detail: '9 in scope' },
    ],
  },
  'Where does my data live?': {
    answer:
      'Locally. Each workspace is one encrypted SQLite file on disk. Documents, embeddings, ACLs, and audit trail all live inside it. Nothing is uploaded to a third-party service, and the workspace is unusable without your passphrase.',
    trace: [
      { label: 'workspace', detail: '~/.revex/workspaces/prod.db' },
      { label: 'encryption', detail: 'AES-256-GCM · sealed' },
      { label: 'audit', detail: 'append-only ledger' },
    ],
  },
};