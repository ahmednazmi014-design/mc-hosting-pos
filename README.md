# MC Hosting POS

A standalone Minecraft hosting storefront and operations dashboard, cloned from the existing POS architecture without changing the FRIXO project or repository.

## Included

- Dark gaming storefront with editable Minecraft hosting plans.
- Existing checkout, order lifecycle, customer order tracking, admin order management, and gallery upload flows.
- New `/admin/hosting` control center for server cards, player counts, server status, expiry dates, and renewal records.
- Drizzle/MySQL schema for `hostingServers` and `hostingRenewals`.
- Demo fallback server cards and renewal data when no database is configured.

## Local setup

```bash
pnpm install
cp .env.example .env
pnpm drizzle-kit migrate
pnpm dev
```

The customer storefront is at `/`. The hosting operations dashboard is at `/admin/hosting` and requires an administrator account.

## Database

This project expects its own MySQL/TiDB `DATABASE_URL`. Do not point it at the FRIXO production database. The generated hosting migration is in `drizzle/0005_small_tana_nile.sql`; apply migrations only after configuring a separate MC Hosting database.

## Deployment

Deploy this repository independently from FRIXO. Configure the required OAuth, database, and Manus runtime variables in the hosting provider, then run the build command from `package.json`.
