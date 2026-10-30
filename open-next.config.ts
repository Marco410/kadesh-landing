import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

// El blog, la home y los OG usan `revalidate` (ISR): la caché vive en R2 y las
// revalidaciones en segundo plano pasan por la cola de Durable Objects.
const config = defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
});

// Next 15 ya compila con webpack. Si algún día suben a Next 16, hay que agregar
// `--webpack` a este comando, porque con Turbopack el worker pasa del límite de
// 10 MB comprimido de Cloudflare.
config.buildCommand = "NODE_OPTIONS=--max-old-space-size=6144 pnpm next build";

export default config;
