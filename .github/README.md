# GitHub: flujo y pipelines

## Flujo de ramas

```
feat/… ──PR──► develop ──PR release──► main (prod)
                    ▲                     │
                    └──── hotfix sync ────┘ (si hubo hotfix directo)
```

1. Crea la rama desde `develop`: `git checkout -b feat/mi-cambio origin/develop`
2. Abre el PR **contra `develop`** (`gh pr create --base develop`)
3. El workflow **CI** corre lint y `build`
4. Al mergear a `develop`, el workflow **Promote** abre/actualiza un PR `develop` → `main`
5. Cuando esté validado, mergeas ese PR de release a `main`
6. El push a `main` avisa a kadesh-back (SystemRelease borrador, producto Pet)

> Nota: en kadesh-business la rama de integración se llama `dev`. Aquí es **`develop`**.

## Workflows

| Archivo | Qué hace |
|---------|----------|
| `ci.yml` | Lint + build en PRs/pushes a `develop` y `main` |
| `promote-develop-to-main.yml` | Abre/actualiza PR de release `develop` → `main` |
| `notify-system-release.yml` | Tras push a `main`, manda la novedad al backend |

## Cómo saber que “está todo ok”

- Verde en el check **CI / Lint y build** del PR a `develop`
- Probaste en el preview de Vercel ligado a `develop` (o la rama del PR)
- Luego mergeas el PR **Release: promote develop → main** (también debe pasar CI)

## Branch protection (recomendado en GitHub)

En Settings → Branches, para `develop` y `main`:

- Require a pull request before merging
- Require status checks to pass → marca el job de **CI**
- (Opcional) Require approvals

Sin esto, el CI informa pero no bloquea el merge.

## Disparo manual del release PR

Actions → **Promote develop → main** → Run workflow.
