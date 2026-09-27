# Cravings

A food-delivery academic project with customer, restaurant-owner, rider, and administrator workflows. Built with Next.js 16.2.9, React 19, TypeScript, Tailwind CSS 4, Auth.js, and PostgreSQL using raw SQL.

## Documentation

Start with the [project audit and documentation index](docs/README.md).

- [Architecture](docs/ARCHITECTURE.md) and [code/API map](docs/CODE_MAP.md)
- [Feature scope, working parts, and limitations](docs/FEATURES.md)
- [Database and rider/owner profile alignment](docs/DATABASE.md)
- [Problems and fixes — repair handoff and later-session prompt](docs/PROBLEMS_AND_FIXES.md)
- [Verification results](docs/VERIFICATION.md) and [academic completion plan](docs/COMPLETION_PLAN.md)
- [File-level source inventory](docs/SOURCE_INVENTORY.md)

The September 2026 audit found that TypeScript and production build pass, while lint and several core SQL queries fail. The complete order/delivery workflow still needs repairs. Documentation distinguishes observed reads, static findings, and untested mutations.

## Local development

Install dependencies with `npm ci`, configure a private `.env.local`, and run `npm run dev`. The homepage is `/`, implemented in `app/(customer)/page.tsx`. See the [setup reference](docs/COMPLETION_PLAN.md) for environment variables and verification commands.

Database setup is not yet reliably reproducible from the historical SQL files. Do not execute all schema/seed scripts against an existing database: some drop or truncate records. Follow the [database reconciliation plan](docs/DATABASE.md) and establish a disposable test database first.

```powershell
npx tsc --noEmit --incremental false
npm run lint
npm run build
npm run start
```

Read AGENTS.md and the relevant installed Next.js guides under `node_modules/next/dist/docs/` before application changes. Older archived documentation describes earlier versions of the project; the current audit identifies known conflicts.
