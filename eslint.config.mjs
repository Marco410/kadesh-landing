import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __dirname = dirname(fileURLToPath(import.meta.url));

// eslint-config-next 15 publica su configuración en el formato clásico; FlatCompat la adapta
// al formato plano de ESLint 9. Al subir a Next 16, `eslint-config-next` ya trae formato plano.
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".open-next/**",
      ".wrangler/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "cloudflare-env.d.ts",
      // Scripts de skills de agentes (de terceros), no son código de la app.
      ".claude/**",
      ".cursor/**",
    ],
  },
];

export default eslintConfig;
