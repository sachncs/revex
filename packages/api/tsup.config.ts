import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node22',
  esbuildOptions(options) {
    /* Strip console.log / console.warn from the production build so
     * per-request breadcrumb logs never reach stdout. console.error
     * is preserved for unrecoverable failures. The REVEX_CONSOLE=1
     * env var re-enables them at runtime by re-patching process.stdout
     * (no-op for the production build itself). */
    options.pure = ['console.log', 'console.warn'];
  },
});