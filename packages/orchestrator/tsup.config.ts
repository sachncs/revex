import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', __internal: 'src/__internal.ts' },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node22',
  external: ['strands-agents'],
  esbuildOptions(options) {
    /* Strip console.log / console.warn from the production build of
     * @revex/orchestrator so per-LLM-call breadcrumb logs never
     * reach stdout. */
    options.pure = ['console.log', 'console.warn'];
  },
});