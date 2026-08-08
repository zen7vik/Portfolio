import type { CaseDiagram } from '@/components/case/diagramTypes'

const NODE_H = 44

export { NODE_H }

const workflowPlatform: CaseDiagram = {
  nodes: [
    { id: 'trigger', x: 20, y: 30, w: 130, label: 'Trigger', sub: 'event / schedule' },
    { id: 'engine', x: 210, y: 30, w: 150, label: 'Interpreter', sub: 'walks the graph' },
    { id: 'temporal', x: 420, y: 30, w: 130, label: 'Temporal', sub: 'durable activities' },
    { id: 'httpnode', x: 210, y: 130, w: 150, label: 'HTTP Node', sub: 'generic integration' },
    { id: 'vault', x: 20, y: 230, w: 150, label: 'Credential vault', sub: 'envelope-encrypted' },
    { id: 'dialer', x: 210, y: 230, w: 150, label: 'SSRF dialer', sub: 'DNS-pinned egress' },
    { id: 'external', x: 420, y: 230, w: 130, label: 'External API', sub: 'Slack, Jira, any' },
    { id: 'classify', x: 210, y: 330, w: 150, label: 'Classifier', sub: 'branch or halt' },
    { id: 'insights', x: 420, y: 330, w: 130, label: 'Insights', sub: 'per-run metrics' },
  ],
  edges: [
    { from: 'trigger', to: 'engine' },
    { from: 'engine', to: 'temporal' },
    { from: 'engine', to: 'httpnode' },
    { from: 'httpnode', to: 'vault' },
    { from: 'httpnode', to: 'dialer' },
    { from: 'dialer', to: 'external' },
    { from: 'external', to: 'classify' },
    { from: 'engine', to: 'insights' },
  ],
  steps: [
    {
      id: 'graph',
      title: 'A workflow is a graph',
      body: 'Versioned JSON: typed nodes, edges as targets. A framework-agnostic interpreter walks it; every node stays deterministic and delegates I/O to Temporal activities, so replay is always correct.',
      highlight: ['trigger', 'engine', 'temporal', 'trigger-engine', 'engine-temporal'],
    },
    {
      id: 'node',
      title: 'One node, any API',
      body: 'The HTTP node turned the fixed menu into a platform. Method, URL, headers, body, credential: all config. Adding an integration became workflow configuration, not a feature request.',
      highlight: ['engine', 'httpnode', 'engine-httpnode'],
    },
    {
      id: 'creds',
      title: 'Secrets nobody can read',
      body: 'Credentials live envelope-encrypted in the admin service. At execution the runtime resolves ciphertext and decrypts per sensitive field through the auth service. No plaintext in logs, no read-back API.',
      highlight: ['httpnode', 'vault', 'httpnode-vault'],
    },
    {
      id: 'egress',
      title: 'Egress that cannot turn inward',
      body: 'The dialer resolves DNS once and pins the connection to that IP; private ranges, link-local, and metadata endpoints are rejected, with per-credential exact-host allowlists on top. The rebind-after-validation bypass class is closed by construction.',
      highlight: ['httpnode', 'dialer', 'external', 'httpnode-dialer', 'dialer-external'],
    },
    {
      id: 'classify',
      title: 'Failures with semantics',
      body: 'Every outcome is classified. Got an HTTP status: the workflow branches on it like data. No response for security or config reasons: the run halts. One rule replaced a mess of retry flags.',
      highlight: ['external', 'classify', 'external-classify'],
    },
    {
      id: 'insights',
      title: 'Watching itself run',
      body: 'An event-driven insights pipeline emits per-run metrics behind a feature flag: which workflows run, where they fail, how long nodes take. 147K runs a month, visible.',
      highlight: ['engine', 'insights', 'engine-insights'],
    },
  ],
}

const riskEngine: CaseDiagram = {
  nodes: [
    { id: 'upstream', x: 20, y: 30, w: 140, label: 'Upstream events', sub: 'controls, assessments' },
    { id: 'reactor', x: 220, y: 30, w: 140, label: 'Scoring reactor', sub: 'decides what to rescore' },
    { id: 'buffer', x: 420, y: 30, w: 130, label: 'Buffer queue', sub: 'dedupes storms' },
    { id: 'consumer', x: 220, y: 130, w: 140, label: 'Scoring consumer', sub: 'assembles inputs' },
    { id: 'simapi', x: 420, y: 130, w: 130, label: 'Simulation API', sub: 'FAIR / Monte Carlo' },
    { id: 'cache', x: 20, y: 130, w: 140, label: 'Redis cache', sub: 'input-hash keyed, 24h' },
    { id: 'entity', x: 220, y: 230, w: 140, label: 'Entity roll-up', sub: 'scenario → org score' },
    { id: 'kill', x: 20, y: 330, w: 140, label: 'Kill switch', sub: 'drain, never pile up' },
    { id: 'heal', x: 220, y: 330, w: 140, label: 'Self-healing job', sub: 'every 10 minutes' },
  ],
  edges: [
    { from: 'upstream', to: 'reactor' },
    { from: 'reactor', to: 'buffer' },
    { from: 'buffer', to: 'consumer' },
    { from: 'consumer', to: 'simapi' },
    { from: 'consumer', to: 'cache' },
    { from: 'consumer', to: 'entity' },
    { from: 'kill', to: 'consumer' },
    { from: 'heal', to: 'entity' },
  ],
  steps: [
    {
      id: 'flow',
      title: '500M events, one pipeline',
      body: 'Every control change, assessment, and threat-intel update flows through the reactor, which decides what actually needs rescoring. Nothing recomputes wholesale.',
      highlight: ['upstream', 'reactor', 'upstream-reactor'],
    },
    {
      id: 'dedupe',
      title: 'The cheapest simulation is none',
      body: 'A buffer queue with a short TTL collapses control-storms before they fan out. Input-hash caching means identical scoring requests within 24 hours never hit the simulation API.',
      highlight: ['buffer', 'cache', 'reactor-buffer', 'consumer-cache'],
    },
    {
      id: 'score',
      title: 'Orchestrate, then aggregate',
      body: 'Consumers assemble inputs and call the external FAIR/Monte Carlo engine, persist per-scenario results, then roll scenarios up to entity scores. One control change never re-simulates a whole org.',
      highlight: ['consumer', 'simapi', 'entity', 'buffer-consumer', 'consumer-simapi', 'consumer-entity'],
    },
    {
      id: 'incidents',
      title: 'The reliability war',
      body: 'Ten memory incidents, fourteen CPU incidents, three weeks. Memory retention fixed by loading 9 columns instead of 40-column ORM instances; guarded mutex-cache eviction; database indexing on the hot paths; an O(n squared) loop made linear.',
      highlight: ['consumer', 'entity'],
    },
    {
      id: 'operate',
      title: 'Designed degradation',
      body: 'A kill switch at the top of the scoring path drains messages when the downstream API degrades, while forced rescores still pass. A self-healing job regenerates stale risk data every 10 minutes. Outages became non-events.',
      highlight: ['kill', 'heal', 'kill-consumer', 'heal-entity'],
    },
  ],
}

const ragPipeline: CaseDiagram = {
  nodes: [
    { id: 'upload', x: 20, y: 30, w: 140, label: 'Direct upload', sub: 'S3 signed URLs' },
    { id: 'scan', x: 220, y: 30, w: 140, label: 'Malware scan', sub: 'async, status-driven' },
    { id: 'chunk', x: 420, y: 30, w: 130, label: 'Chunk + embed', sub: 'async consumer' },
    { id: 'index', x: 420, y: 130, w: 130, label: 'OpenSearch', sub: 'hybrid vector + keyword' },
    { id: 'retrieve', x: 220, y: 130, w: 140, label: 'Retrieval', sub: 'top chunks per question' },
    { id: 'gateway', x: 20, y: 130, w: 140, label: 'LLM gateway', sub: 'GPT-4o / Claude' },
    { id: 'answers', x: 20, y: 230, w: 140, label: 'Drafted answers', sub: 'questionnaires' },
    { id: 'review', x: 220, y: 230, w: 140, label: 'AI review', sub: 'contradiction flags' },
  ],
  edges: [
    { from: 'upload', to: 'scan' },
    { from: 'scan', to: 'chunk' },
    { from: 'chunk', to: 'index' },
    { from: 'index', to: 'retrieve' },
    { from: 'retrieve', to: 'gateway' },
    { from: 'gateway', to: 'answers' },
    { from: 'answers', to: 'review' },
  ],
  steps: [
    {
      id: 'ingest',
      title: 'Arbitrary files, safely',
      body: 'Clients upload straight to S3 via signed URLs and confirm completion. A malware scan runs asynchronously; document status is the single source of truth, and a consumer-vs-API race is settled by UUID idempotency.',
      highlight: ['upload', 'scan', 'upload-scan'],
    },
    {
      id: 'embed',
      title: 'Documents become retrievable',
      body: 'Clean documents are chunked and embedded into AWS OpenSearch Serverless. Hybrid retrieval, vector plus keyword, because compliance language is exactly where pure semantic search gets vague.',
      highlight: ['chunk', 'index', 'scan-chunk', 'chunk-index'],
    },
    {
      id: 'answer',
      title: 'Questionnaires answer themselves',
      body: 'Auto-answer retrieves the relevant chunks and drafts through the internal multi-provider gateway. Model choice is configuration, not architecture. Analysts review drafts instead of writing from scratch.',
      highlight: ['retrieve', 'gateway', 'answers', 'index-retrieve', 'retrieve-gateway', 'gateway-answers'],
    },
    {
      id: 'review',
      title: 'Then it reviews the vendors',
      body: 'The same index powers an AI review pass over vendor-submitted answers, flagging contradictions against uploaded evidence before an analyst ever reads them.',
      highlight: ['review', 'answers-review'],
    },
  ],
}

const dataExchange: CaseDiagram = {
  nodes: [
    { id: 'outgoing', x: 20, y: 30, w: 150, label: 'Outgoing tenant', sub: 'fetch + strip PII' },
    { id: 's3out', x: 240, y: 30, w: 130, label: 'S3 (source)', sub: 'versioned JSON' },
    { id: 'sts', x: 240, y: 130, w: 130, label: 'STS assume-role', sub: 'External ID' },
    { id: 's3in', x: 420, y: 130, w: 130, label: 'S3 (dest)', sub: 'cross-account copy' },
    { id: 'ingest', x: 420, y: 230, w: 130, label: 'Ingest', sub: 'external findings' },
    { id: 'contract', x: 20, y: 130, w: 150, label: 'Contract', sub: 'consent + bindings' },
    { id: 'retry', x: 20, y: 230, w: 150, label: 'Delay-retry + DLQ', sub: 'backoff with jitter' },
    { id: 'table', x: 240, y: 230, w: 130, label: 'DynamoDB', sub: 'one table, by design' },
  ],
  edges: [
    { from: 'outgoing', to: 's3out' },
    { from: 's3out', to: 'sts' },
    { from: 'sts', to: 's3in' },
    { from: 's3in', to: 'ingest' },
    { from: 'contract', to: 'sts' },
    { from: 'retry', to: 'table' },
  ],
  steps: [
    {
      id: 'consent',
      title: 'Consent is a record',
      body: 'A contract captures who shares what with whom: status lifecycle, bindings for the shared slices, idempotent conditional creation. No contract, no movement.',
      highlight: ['contract'],
    },
    {
      id: 'generate',
      title: 'Generate and strip',
      body: 'On each run the outgoing side concurrently fetches risk, controls, and findings from upstream services, strips PII, and uploads versioned JSON artifacts.',
      highlight: ['outgoing', 's3out', 'outgoing-s3out'],
    },
    {
      id: 'copy',
      title: 'Across the account boundary',
      body: 'The copy step assumes a role in the source account via STS with a deterministic External ID derived from account and region. Confused-deputy closed: a leaked role ARN alone is useless.',
      highlight: ['sts', 's3in', 'contract-sts', 's3out-sts', 'sts-s3in'],
    },
    {
      id: 'ingest',
      title: 'Landing as first-class data',
      body: 'Received artifacts become external findings on the consuming tenant. Retriable failures route through a delayed-message exchange with exponential backoff and jitter; poison messages land in a DLQ.',
      highlight: ['ingest', 'retry', 's3in-ingest'],
    },
    {
      id: 'table',
      title: 'One table, deliberately',
      body: 'Contracts and sync history share a single DynamoDB table. Secondary-index keys are written but the index is not provisioned; promoting them later is a zero-migration change. Cost-shaped schema.',
      highlight: ['table', 'retry-table'],
    },
  ],
}

const registry: Record<string, CaseDiagram> = {
  'workflow-platform': workflowPlatform,
  'risk-engine': riskEngine,
  'rag-pipeline': ragPipeline,
  'data-exchange': dataExchange,
}

export function getCaseDiagram(slug: string): CaseDiagram | null {
  return registry[slug] ?? null
}
