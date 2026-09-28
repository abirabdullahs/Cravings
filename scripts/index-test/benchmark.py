#!/usr/bin/env python3
"""Repeatable PostgreSQL index benchmark for the Cravings project.

Uses PostgreSQL's psql client, so no third-party Python package is required.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
from pathlib import Path
import re
import shutil
import statistics
import subprocess
import sys
from typing import Any


ROOT = Path(__file__).resolve().parent
DEFAULT_QUERIES = ROOT / "queries.sql"
SAFE_DATABASE = re.compile(
    r"(?:^|[-_])(index[-_]?demo|index[-_]?test|benchmark)(?:$|[-_])", re.I
)
SAFE_INDEX = re.compile(r"^[a-z_][a-z0-9_]*$", re.I)


def find_psql() -> str:
    configured = os.environ.get("PSQL_PATH")
    candidates = [configured, shutil.which("psql")]
    if os.name == "nt":
        candidates.extend(
            [
                r"E:\postgres\bin\psql.exe",
                r"C:\Program Files\PostgreSQL\18\bin\psql.exe",
                r"C:\Program Files\PostgreSQL\17\bin\psql.exe",
                r"C:\Program Files\PostgreSQL\16\bin\psql.exe",
            ]
        )
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return str(candidate)
    raise RuntimeError("psql was not found. Put it on PATH or set PSQL_PATH.")


def read_sql(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def parse_queries(path: Path) -> list[dict[str, str]]:
    """Parse -- name/-- index metadata followed by one SELECT ending in ;."""
    queries: list[dict[str, str]] = []
    name: str | None = None
    indexes = ""
    buffer: list[str] = []

    for line in read_sql(path).splitlines():
        name_match = re.match(r"--\s*name:\s*(.+)", line, re.I)
        index_match = re.match(r"--\s*index:\s*(.+)", line, re.I)
        if name_match:
            name = name_match.group(1).strip()
            continue
        if index_match:
            indexes = index_match.group(1).strip()
            continue
        if line.strip().startswith("--"):
            continue

        buffer.append(line)
        if line.strip().endswith(";"):
            sql = "\n".join(buffer).strip().rstrip(";").strip()
            if sql:
                if not re.match(r"^(SELECT|WITH)\b", sql, re.I):
                    raise ValueError(
                        f"Only read-only SELECT/WITH queries are allowed: {name}"
                    )
                queries.append(
                    {
                        "name": name or f"Q{len(queries) + 1}",
                        "indexes": indexes,
                        "sql": sql,
                    }
                )
            name, indexes, buffer = None, "", []

    if "".join(buffer).strip():
        raise ValueError(f"Query file ends without a semicolon: {path}")
    if not queries:
        raise ValueError(f"No queries found in {path}")
    return queries


def run_psql(
    dsn: str,
    *,
    sql: str | None = None,
    file: Path | None = None,
    tuples_only: bool = False,
) -> str:
    if (sql is None) == (file is None):
        raise ValueError("Provide exactly one of sql or file")
    command = [
        find_psql(),
        "--no-psqlrc",
        "--quiet",
        "--set",
        "ON_ERROR_STOP=1",
        "--dbname",
        dsn,
    ]
    if tuples_only:
        command.extend(["--tuples-only", "--no-align"])
    if file is not None:
        command.extend(["--file", str(file)])
        input_text = None
    else:
        input_text = sql

    completed = subprocess.run(
        command,
        input=input_text,
        text=True,
        encoding="utf-8",
        capture_output=True,
        check=False,
    )
    if completed.returncode:
        detail = completed.stderr.strip() or completed.stdout.strip()
        raise RuntimeError(f"psql failed: {detail}")
    return completed.stdout.strip()


def plan_nodes(plan: dict[str, Any]):
    yield plan
    for child in plan.get("Plans", []):
        yield from plan_nodes(child)


def summarize_plan(plan: dict[str, Any]) -> str:
    scans: list[str] = []
    for node in plan_nodes(plan):
        node_type = node.get("Node Type", "")
        if "Scan" not in node_type:
            continue
        index_name = node.get("Index Name")
        label = f"{node_type} ({index_name})" if index_name else node_type
        if label not in scans:
            scans.append(label)
    return " + ".join(scans) or plan.get("Node Type", "Unknown")


def explain_json(dsn: str, sql: str) -> dict[str, Any]:
    output = run_psql(
        dsn,
        sql="EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) " + sql + ";",
        tuples_only=True,
    )
    return json.loads(output)[0]


def explain_text(dsn: str, sql: str) -> str:
    return run_psql(
        dsn,
        sql="EXPLAIN (ANALYZE, BUFFERS) " + sql + ";",
        tuples_only=True,
    )


def positive_runs(runs: int) -> int:
    if runs < 1:
        raise ValueError("--runs must be at least 1")
    return runs


def benchmark(dsn: str, queries: list[dict[str, str]], runs: int):
    results: list[dict[str, Any]] = []
    for query in queries:
        try:
            explain_json(dsn, query["sql"])  # warm-up
            plans = [explain_json(dsn, query["sql"]) for _ in range(runs)]
            times = [float(plan["Execution Time"]) for plan in plans]
            root = plans[-1]["Plan"]
            results.append(
                {
                    "query": query["name"],
                    "indexes": query["indexes"],
                    "sql": query["sql"],
                    "median_ms": round(statistics.median(times), 3),
                    "min_ms": round(min(times), 3),
                    "max_ms": round(max(times), 3),
                    "plan": summarize_plan(root),
                    "buffers": int(root.get("Shared Hit Blocks", 0))
                    + int(root.get("Shared Read Blocks", 0)),
                }
            )
        except Exception as error:
            raise RuntimeError(f'{query["name"]} failed: {error}') from error
    return results


def print_results(label: str, results: list[dict[str, Any]]) -> None:
    print(f"\n{label.upper()}")
    for result in results:
        print(
            f'{result["query"][:42]:42} '
            f'{result["median_ms"]:10.3f} ms  '
            f'{result["plan"][:68]}  buffers={result["buffers"]}'
        )


def write_json(label: str, results: list[dict[str, Any]]) -> Path:
    safe_label = re.sub(r"[^a-zA-Z0-9_-]", "_", label)
    path = ROOT / f"results_{safe_label}.json"
    path.write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")
    return path


def load_results(label_or_path: str) -> list[dict[str, Any]]:
    candidate = Path(label_or_path)
    path = candidate if candidate.exists() else ROOT / f"results_{label_or_path}.json"
    return json.loads(path.read_text(encoding="utf-8"))


def comparison_rows(before: list[dict[str, Any]], after: list[dict[str, Any]]):
    after_by_name = {row["query"]: row for row in after}
    for old in before:
        new = after_by_name.get(old["query"])
        if new is None:
            raise ValueError(f'Missing after result for {old["query"]}')
        speedup = old["median_ms"] / new["median_ms"] if new["median_ms"] else float("inf")
        yield old, new, speedup


def make_report(
    before: list[dict[str, Any]],
    after: list[dict[str, Any]],
    database: str,
    server_version: str,
    size_before: int,
    size_after: int,
) -> str:
    lines = [
        "# Cravings index benchmark: measured results",
        "",
        f"Generated: {dt.datetime.now().astimezone().isoformat(timespec='seconds')}",
        f"Database: `{database}` · PostgreSQL `{server_version}`",
        "",
        "The same seeded data and application queries were measured before and after",
        "creating the secondary indexes from `03_indexes.sql`. Primary-key and UNIQUE",
        "constraint indexes remain in both phases because the application requires them.",
        "Each query has one warm-up followed by repeated `EXPLAIN (ANALYZE, BUFFERS)` runs;",
        "the table reports the median.",
        "",
        "| Query | Relevant index | Before | After | Speedup | Plan change | Buffers |",
        "|---|---|---:|---:|---:|---|---:|",
    ]
    for old, new, speedup in comparison_rows(before, after):
        lines.append(
            f'| {old["query"]} | `{old["indexes"]}` | {old["median_ms"]:.3f} ms '
            f'| {new["median_ms"]:.3f} ms | **{speedup:.1f}×** '
            f'| {old["plan"]} → {new["plan"]} '
            f'| {old["buffers"]} → {new["buffers"]} |'
        )

    size_delta = size_after - size_before
    size_pct = (size_delta / size_before * 100) if size_before else 0
    lines.extend(
        [
            "",
            "## Storage cost",
            "",
            f"Database size: **{size_before / 1024 / 1024:.1f} MB → "
            f"{size_after / 1024 / 1024:.1f} MB** "
            f"({size_delta / 1024 / 1024:+.1f} MB, {size_pct:+.1f}%).",
            "",
            "Indexes reduce reads by avoiding full-table scans, but consume disk and add",
            "maintenance work to INSERT, UPDATE, and DELETE operations. During the demo,",
            "point out the plan change from `Seq Scan` to `Index Scan` or",
            "`Bitmap Index Scan`, plus the reduction in buffers touched.",
            "",
            "## Live evaluator demonstration",
            "",
            "```powershell",
            'python scripts/index-test/benchmark.py live --query "Items of one order"',
            "```",
            "",
            "The command drops only that query's declared secondary indexes inside a",
            "transaction, displays the before plan, rolls back to restore the indexes,",
            "then displays the after plan. It does not mutate application data.",
            "",
            "## Queries used",
            "",
        ]
    )
    for row in after:
        lines.extend([f'### {row["query"]}', "", "```sql", row["sql"] + ";", "```", ""])
    return "\n".join(lines)


def connection_info(dsn: str) -> tuple[str, str]:
    output = run_psql(
        dsn,
        sql="SELECT current_database() || E'\\t' || current_setting('server_version');",
        tuples_only=True,
    )
    database, version = output.split("\t", 1)
    return database, version


def database_size(dsn: str) -> int:
    output = run_psql(
        dsn,
        sql="SELECT pg_database_size(current_database());",
        tuples_only=True,
    )
    return int(output)


def require_demo_database(dsn: str) -> str:
    database, _ = connection_info(dsn)
    if not SAFE_DATABASE.search(database):
        raise RuntimeError(
            f'Refusing destructive benchmark setup on database "{database}". '
            "Use a disposable name containing index_demo, index_test, or benchmark."
        )
    return database


def reset_and_seed(dsn: str) -> None:
    require_demo_database(dsn)
    run_psql(dsn, sql="DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
    run_psql(dsn, file=ROOT / "01_schema_no_indexes.sql")
    run_psql(dsn, file=ROOT / "02_seed.sql")


def create_indexes(dsn: str) -> None:
    run_psql(dsn, file=ROOT / "03_indexes.sql")


def index_names(query: dict[str, str]) -> list[str]:
    names = [name.strip() for name in query["indexes"].split(",") if name.strip()]
    if not names:
        raise ValueError(f'{query["name"]} has no -- index metadata')
    if any(not SAFE_INDEX.fullmatch(name) for name in names):
        raise ValueError(f'Unsafe index name in {query["name"]}')
    return names


def select_query(queries: list[dict[str, str]], search: str) -> dict[str, str]:
    matches = [query for query in queries if search.lower() in query["name"].lower()]
    if len(matches) != 1:
        names = "\n  ".join(query["name"] for query in queries)
        raise ValueError(f"Query selector matched {len(matches)} queries. Available:\n  {names}")
    return matches[0]


def run_command(args) -> None:
    queries = parse_queries(Path(args.queries))
    results = benchmark(args.dsn, queries, positive_runs(args.runs))
    write_json(args.label, results)
    print_results(args.label, results)


def compare_command(args) -> None:
    before = load_results(args.before)
    after = load_results(args.after)
    for old, new, speedup in comparison_rows(before, after):
        print(
            f'{old["query"]}: {old["median_ms"]:.3f} ms -> '
            f'{new["median_ms"]:.3f} ms ({speedup:.1f}x)'
        )


def demo_command(args) -> None:
    queries = parse_queries(Path(args.queries))
    database = require_demo_database(args.dsn)
    print(f"Resetting and seeding disposable database {database}...")
    reset_and_seed(args.dsn)
    size_before = database_size(args.dsn)
    before = benchmark(args.dsn, queries, positive_runs(args.runs))
    print_results("before", before)
    write_json("before", before)

    print("\nCreating project indexes...")
    create_indexes(args.dsn)
    size_after = database_size(args.dsn)
    after = benchmark(args.dsn, queries, positive_runs(args.runs))
    print_results("after", after)
    write_json("after", after)
    _, version = connection_info(args.dsn)

    report = make_report(before, after, database, version, size_before, size_after)
    report_path = ROOT / "REPORT.md"
    report_path.write_text(report, encoding="utf-8")
    print(f"\nWrote measured report to {report_path}")


def live_command(args) -> None:
    queries = parse_queries(Path(args.queries))
    query = select_query(queries, args.query)
    indexes = index_names(query)
    require_demo_database(args.dsn)

    values = ", ".join("'" + name + "'" for name in indexes)
    output = run_psql(
        args.dsn,
        sql=(
            "SELECT indexname FROM pg_indexes "
            "WHERE schemaname = 'public' AND indexname IN (" + values + ");"
        ),
        tuples_only=True,
    )
    present = set(output.splitlines())
    missing = [name for name in indexes if name not in present]
    if missing:
        raise RuntimeError("Run demo first; missing indexes: " + ", ".join(missing))

    drops = "; ".join(f'DROP INDEX "{name}"' for name in indexes)
    before_plan = run_psql(
        args.dsn,
        sql=f"BEGIN; {drops}; EXPLAIN (ANALYZE, BUFFERS) {query['sql']}; ROLLBACK;",
        tuples_only=True,
    )
    after_plan = explain_text(args.dsn, query["sql"])

    print(f'\nQUERY: {query["name"]}')
    print(f'INDEXES: {", ".join(indexes)}')
    print("\n--- BEFORE: indexes dropped inside transaction ---")
    print(before_plan)
    print("\n--- AFTER: rollback restored indexes ---")
    print(after_plan)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)

    def common(command):
        command.add_argument(
            "--dsn",
            default=os.environ.get("INDEX_DEMO_DATABASE_URL"),
            required="INDEX_DEMO_DATABASE_URL" not in os.environ,
            help="Disposable PostgreSQL DSN (or set INDEX_DEMO_DATABASE_URL)",
        )
        command.add_argument("--queries", default=str(DEFAULT_QUERIES))

    run_parser = commands.add_parser("run", help="Measure the database in its current state")
    common(run_parser)
    run_parser.add_argument("--label", required=True)
    run_parser.add_argument("--runs", type=int, default=7)
    run_parser.set_defaults(handler=run_command)

    compare_parser = commands.add_parser("compare", help="Compare two saved JSON runs")
    compare_parser.add_argument("before")
    compare_parser.add_argument("after")
    compare_parser.set_defaults(handler=compare_command)

    demo_parser = commands.add_parser("demo", help="Reset, seed, benchmark, index, and report")
    common(demo_parser)
    demo_parser.add_argument("--runs", type=int, default=7)
    demo_parser.set_defaults(handler=demo_command)

    live_parser = commands.add_parser("live", help="Show one real before/after EXPLAIN plan")
    common(live_parser)
    live_parser.add_argument("--query", default="Items of one order")
    live_parser.set_defaults(handler=live_command)
    return parser


if __name__ == "__main__":
    try:
        arguments = build_parser().parse_args()
        arguments.handler(arguments)
    except (OSError, ValueError, RuntimeError, json.JSONDecodeError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        sys.exit(1)
