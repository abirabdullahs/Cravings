# PostgreSQL index demonstration

This folder benchmarks parameter-filled versions of queries used by Cravings.
It measures the same data before and after the 16 secondary indexes in
`03_indexes.sql`, then generates `REPORT.md` from the real results.

## One-time setup

Use a separate database. The `demo` command intentionally resets its `public`
schema and refuses any database whose name does not contain `index_demo`,
`index_test`, or `benchmark`.

```powershell
# Use the same host/user/password as the app, but a disposable database name.
& 'E:\postgres\bin\createdb.exe' -W -h localhost -U postgres cravings_index_demo
$env:INDEX_DEMO_DATABASE_URL = 'host=localhost port=5432 dbname=cravings_index_demo user=postgres password=YOUR_PASSWORD'
```

If the database already exists, skip `createdb`. Keep the environment variable
only in the terminal; do not commit a password. A hosted Supabase project does
not normally let an application user create another database, so use the local
PostgreSQL service (or another disposable PostgreSQL instance) for this demo.

The runner needs Python 3 and PostgreSQL's `psql`, but no Python packages. It
finds this project's `E:\postgres\bin\psql.exe` automatically. On another
machine, put `psql` on `PATH` or set `$env:PSQL_PATH` to its full path.

## Generate the before/after report

From the repository root:

```powershell
python scripts/index-test/benchmark.py demo
```

This resets and seeds only the disposable database, measures every query seven
times after one warm-up, creates the indexes, measures again, and writes:

- `results_before.json`
- `results_after.json`
- `REPORT.md`

The seed is intentionally large, so initial setup can take a few minutes.

## Live evaluator demonstration

Run the full demo once before the presentation. During the presentation, use:

```powershell
python scripts/index-test/benchmark.py live --query "Items of one order"
```

The command temporarily drops only the query's declared index inside a
transaction, prints the unindexed `EXPLAIN (ANALYZE, BUFFERS)` plan, rolls back
to restore the index, and prints the indexed plan. Point out:

1. `Seq Scan` before versus `Index Scan` after.
2. Lower `Execution Time` after indexing.
3. Fewer shared buffer pages touched after indexing.

Another visually strong example is:

```powershell
python scripts/index-test/benchmark.py live --query "Latest GPS"
```

The live command changes no application data and refuses to run against a
normally named app database.

### Simplest raw SQL demonstration

If you want to explain the PostgreSQL output directly without Python formatting,
open `simple_explain_demo.sql` in pgAdmin, connect to `cravings_index_demo`, and
run the whole file. It prints two ordinary `EXPLAIN (ANALYZE, BUFFERS)` plans:

1. Before indexing: usually `Seq Scan on order_items`.
2. After indexing: usually `Index Scan` or `Bitmap Index Scan` using
   `ix_order_items_order`.

The index is dropped only inside a transaction. `ROLLBACK` restores it before
the second query. Both queries are identical, so compare their `Execution Time`
and shared buffer counts at the bottom of the raw plans.

## Files

- `01_schema_no_indexes.sql`: relevant tables without secondary indexes.
- `02_seed.sql`: deterministic-scale synthetic application data.
- `03_indexes.sql`: the project indexes being demonstrated.
- `04_drop_indexes.sql`: optional manual reset of those indexes.
- `queries.sql`: real query shapes copied from the project's query layer, with
  fixed benchmark parameters.
- `simple_explain_demo.sql`: one raw before/after `EXPLAIN ANALYZE` example for
  pgAdmin or psql.
- `benchmark.py`: benchmark, comparison, report, and live-plan CLI.

For an individual measurement without resetting data:

```powershell
python scripts/index-test/benchmark.py run --label custom
python scripts/index-test/benchmark.py compare before after
```
