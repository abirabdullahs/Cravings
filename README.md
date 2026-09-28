# Cravings

Cravings is a full-stack food-delivery application built as an academic DBMS project. It demonstrates a complete customer, restaurant-owner, rider, and administrator workflow backed by PostgreSQL and raw SQL.

## Features

### Customer

- Browse restaurants, search by name or cuisine, and view menus and reviews
- Save delivery addresses with map coordinates
- Add menu items to a cart, change quantities, and apply eligible coupons
- Receive a server-calculated order quote before checkout
- Track the order and rider through each delivery milestone
- View order history and detailed receipts, cancel eligible orders, and submit reviews

### Restaurant owner

- Manage restaurant details, business hours, location, categories, and menu items
- Control restaurant and item availability without deleting order history
- Archive and restore restaurants or menu items
- View the kitchen queue with ordered dishes and quantities
- Mark prepared orders as ready for rider pickup

### Rider

- Set duty availability and view unassigned delivery requests
- Accept one active delivery at a time
- Update delivery milestones and location
- View the current delivery, delivery history, and earnings

### Administrator

- Review role applications and manage users
- Monitor restaurants, riders, orders, reviews, and operations
- Assign, requeue, or cancel eligible deliveries
- Create coupons and send notifications
- View platform analytics and profit summaries

## DBMS highlights

The application deliberately uses PostgreSQL directly instead of an ORM. It demonstrates:

- Explicit transactions with commit and rollback for multi-step writes
- A stored procedure for atomic order creation
- Database functions for distance, delivery fee, discount, and quote calculations
- Triggers for timestamps and restaurant-rating maintenance
- Constraints, foreign keys, indexes, enums, and row locking
- Multi-table joins and aggregate queries for dashboards and reports

## Tech stack

| Layer | Technology |
| --- | --- |
| Web application | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Authentication | Auth.js with credentials and optional Google OAuth |
| Database | PostgreSQL with raw SQL through `pg` |
| Client data | TanStack Query |
| Maps | Leaflet and React Leaflet |
| File uploads | UploadThing |
| Icons and analytics | Lucide React and Vercel Analytics |

## Project structure

```text
app/                 Next.js pages, layouts, and API route handlers
components/          Reusable UI and role-specific components
hooks/               Client-side data and state hooks
lib/                 Database connection and shared utilities
services/            Browser-facing API clients
server/
  query/              Raw SQL statements and stored procedures
  repository/         Database access layer
  service/            Validation and application rules
schema/               Canonical schema, migrations, and demo seed data
scripts/              Safe local database reset and seed scripts
types/                Shared TypeScript types
public/               Static images and brand assets
auth.ts               Auth.js configuration
proxy.ts              Page authentication and role routing
```

## Requirements

- Node.js 20 or newer
- PostgreSQL 15 or newer
- npm

## Local setup

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Create a PostgreSQL database for local development. Its name must contain `dev`, `development`, `test`, or `local`, for example `cravings_local`. This naming rule protects other databases from the reset command.

3. Create `.env.local` in the project root:

   ```dotenv
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=cravings_local
   PGUSER=postgres
   PGPASSWORD=your_password

   AUTH_SECRET=replace_with_a_long_random_value
   AUTH_GOOGLE_ID=
   AUTH_GOOGLE_SECRET=

   PLATFORM_FEE=0
   ```

   Google OAuth is optional when using credential login. Add the UploadThing environment values required by your UploadThing account if you want to test image uploads.

4. Build the database:

   ```bash
   npm run db:reset
   ```

   This command loads `.env.local`, recreates the `public` schema, installs the schema and stored procedures, and applies the demo seed data in one transaction. It refuses to run in production or against a database whose name does not match the development/test safety rule.

5. Start the application:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

After running `npm run db:reset`, use `Demo123!` with any seeded account:

| Role | Email |
| --- | --- |
| Administrator | `admin@cravings.local` |
| Customer | `customer@cravings.local` |
| Restaurant owner | `owner@cravings.local` |
| Rider | `rider@cravings.local` |

Additional customer, owner, and rider accounts in `schema/seed.sql` demonstrate concurrent orders, approval states, and different rider duty states.

## Images

The seed uses local files from `public/food` for restaurant covers and `public/placeholder.jpg` where an individual menu photo is unavailable. Local paths such as `/food/chillox.png` work without an external image host. Owners can later upload real cover and menu images through the management forms; the returned upload URL is stored in PostgreSQL.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run db:reset` | Recreate schema, install procedures, and load seed data |
| `npm run db:seed` | Reload demo catalog data in an existing safe database |

`db:reset` and `db:seed` are destructive development utilities. Never point them at a production database.

## Main workflow

1. A customer registers, selects an address, chooses food, and places an order.
2. The restaurant owner sees the dishes in the kitchen queue and marks the order ready.
3. An available rider accepts the delivery and updates pickup and delivery milestones.
4. The customer tracks the delivery, views the final receipt, and can review the completed order.
5. The administrator oversees users, approvals, orders, delivery exceptions, coupons, and reports.

## Verification

Before submitting or deploying, run:

```bash
npx tsc --noEmit --incremental false
npm run lint
npm run build
```

The project is an academic demonstration. Online payment and continuous real-time dispatch are not production integrations; order totals and delivery state are handled by the application and PostgreSQL workflow.
