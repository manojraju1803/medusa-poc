<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    </picture>
  </a>
</p>
<h1 align="center">
  Medusa DTC Starter
</h1>

<h4 align="center">
  <a href="https://docs.medusajs.com">Documentation</a> |
  <a href="https://www.medusajs.com">Website</a>
</h4>

<p align="center">
  Building blocks for digital commerce
</p>
<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/develop/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Medusa is released under the MIT license." />
  </a>
  <a href="https://circleci.com/gh/medusajs/medusa">
    <img src="https://circleci.com/gh/medusajs/medusa.svg?style=shield" alt="Current CircleCI build status." />
  </a>
  <a href="https://github.com/medusajs/medusa/blob/develop/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
    <a href="https://www.producthunt.com/posts/medusa"><img src="https://img.shields.io/badge/Product%20Hunt-%231%20Product%20of%20the%20Day-%23DA552E" alt="Product Hunt"></a>
  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

# Medusa DTC Starter

A production-ready monorepo starter for direct-to-consumer ecommerce stores powered by Medusa and Next.js. Includes a fully featured storefront with product browsing, cart, checkout, customer accounts, and order management.

## Features

- All of [Medusa's commerce features](https://docs.medusajs.com/resources/commerce-modules)
- Multi-region support with automatic country detection
- Product catalog with variant selection
- Cart with promotion codes
- Multi-step checkout with shipping and payment
- Customer accounts with order history and address management
- Order transfer between accounts

## Getting Started

### Local Installation

> **Prerequisites:
>
> - [Node.js](https://nodejs.org/) v20+
> - [PostgreSQL](https://www.postgresql.org/) v15+
> - [pnpm](https://pnpm.io/) v10+

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/medusajs/dtc-starter.git
cd dtc-starter
pnpm install
```

2. Set up environment variables for the backend:

```bash
cp apps/backend/.env.template apps/backend/.env
```

3. Set the database URL in `apps/backend.env`:

```bash
# Replace with actual database URL, make sure the database exists.
DATABASE_URL=postgres://postgres:@localhost:5432/medusa-dtc-starter
```

   Uploaded files (product images, customers' documents) are stored in S3 only,
   and the `S3_*` settings from `.env.template` point at the development
   buckets. The backend won't start without them. Sign in to AWS before
   starting it, and again when the session expires (after up to 12 hours):

```bash
aws login
```

   See [docs/PRIVATE_DOCUMENTS.md](docs/PRIVATE_DOCUMENTS.md) for the buckets and
   what access you need.

4. Run migrations:

```bash
cd apps/backend
pnpm medusa db:migrate
```

5. Add admin user:

```bash
cd apps/backend
pnpm medusa user -e admin@test.com -p supersecret
```

6. Start Medusa backend:

```bash
cd apps/backend
pnpm dev
```

7. Open the admin dashboard at `localhost:9000/app` and log in. Retrieve your publishable API key at Settings > Publishable API key.

8. Set up environment variables for the storefront:

```bash
cp apps/storefront/.env.template apps/storefront/.env.local
```

9. Update `apps/storefront/.env.local` with your Medusa publishable API key:

```bash
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_6c3...
```

10.  Start storefront:

```bash
cd apps/storefront
pnpm dev
```

The storefront runs on `http://localhost:8000`.

You can slo run the following command from the root to start both backend and storefront:

```bash
pnpm dev
```

### Day-to-day development

The recommended way to work on this project: run Postgres and Redis in Docker,
and the backend and storefront directly on your machine. Code changes reload
right away, logs print in your terminal, and your editor can see the installed
packages.

**First time only**

1. Install dependencies from the repo root, with pnpm:

   ```bash
   pnpm install
   ```

   Always use pnpm. `npm install` ignores `pnpm-lock.yaml` and the pnpm
   overrides in the root `package.json`, so it installs different versions,
   and it creates a second lockfile.

2. Start Postgres and Redis:

   ```bash
   docker compose up -d postgres redis
   ```

3. Point the backend at them in `apps/backend/.env` (the values come from
   `docker-compose.yml`):

   ```bash
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/medusa-store
   REDIS_URL=redis://localhost:6379
   ```

4. Set `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in `apps/storefront/.env` to a
   publishable key from this database (admin → Settings → Publishable API
   Keys).

**Every day**

| To… | Run |
|-----|-----|
| Start working | `docker compose up -d postgres redis`, then `pnpm dev` from the repo root |
| Stop | `Ctrl+C` (and `docker compose stop` to stop the database too) |
| Apply migrations | `cd apps/backend`, then `pnpm medusa db:migrate` |
| Add a package | `cd apps/backend` (or `apps/storefront`), then `pnpm add <package>` |
| Query the database | `docker compose exec postgres psql -U postgres -d medusa-store` |

`pnpm dev` starts both apps; `pnpm backend:dev` or `pnpm storefront:dev` starts
just one. The admin runs at `http://localhost:9000/app` and the storefront at
`http://localhost:8000`.

Nothing runs migrations for you in this setup. Run `pnpm medusa db:migrate`
after pulling changes that add migrations or module links, after upgrading
Medusa, and after generating a migration with
`pnpm medusa db:generate <module>`. When nothing is pending, it does nothing.

Don't start the app containers while `pnpm dev` is running: plain
`docker compose up -d` and `pnpm docker:up` also start the `medusa` and
`storefront` containers, which need the same ports (9000 and 8000). If you see
a "port already in use" error, run `docker compose stop medusa storefront`.

Backend and storefront logs print in the terminal running `pnpm dev`.
Server-side fetches in the storefront log there too, not in the browser
console or Network tab.

#### Running everything in Docker instead

`pnpm docker:up` runs Postgres, Redis, the backend and the storefront in
containers. Follow their logs with `pnpm docker:logs` and stop them with
`pnpm docker:down`. Migrations run automatically each time the backend
container starts.

- The containers read `apps/backend/.env` and `apps/storefront/.env` (not
  `.env.local`) and swap in their own database, Redis and backend URLs, so the
  same files work for both setups. Both setups use the same database.
- Packages live in Docker volumes, so the `node_modules` folders on your
  machine stay empty. Run `pnpm install` on your machine as well if you want
  editor support.

### Warehouse coordinates

The location-based product listing needs coordinates on the stock locations.
To add them to the existing Bangalore, Mumbai and Delhi warehouses, run from
`apps/backend`:

```bash
pnpm medusa exec ./src/scripts/seed-warehouses.ts
```

It only sets `lat`, `lng` and `is_default` metadata (Bangalore is the default),
matched by address city. It creates no locations and changes no stock, and is
safe to run again. Only locations linked to the storefront's sales channel are
offered to buyers.

## Configuration

The storefront is configured via environment variables in `apps/storefront/.env.local`:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Publishable API key from your Medusa backend | — |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | URL of your Medusa backend | `http://localhost:9000` |
| `NEXT_PUBLIC_DEFAULT_REGION` | Default region country code | `dk` |
| `NEXT_PUBLIC_BASE_URL` | Base URL of the storefront | `https://localhost:8000` |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe publishable key (optional) | — |

## Resources

- [Medusa Documentation](https://docs.medusajs.com)
