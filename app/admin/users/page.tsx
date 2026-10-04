"use client";

import { useEffect, useState } from "react";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import type { AdminUser } from "@/types/admin-types";
import { AdminPagination } from "@/components/admin/AdminPagination";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      async function load() {
        setLoading(true);
        setError("");
        try {
          const query = new URLSearchParams({ role, search, page: String(page), limit: String(limit) });
          const response = await fetch(`/api/admin/users?${query}`);
          const payload = await response.json();
          if (response.ok) {
            setUsers(payload.users ?? []);
            setTotal(Number(payload.total ?? 0));
          }
          else setError(payload.error || "Could not load users.");
        } catch {
          setError("Could not load users.");
        } finally {
          setLoading(false);
        }
      }
      void load();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [role, search, page]);

  function updateSearch(value: string) {
    setPage(1);
    setSearch(value);
  }

  function updateRole(value: string) {
    setPage(1);
    setRole(value);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Admin users
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold">User management</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Search accounts and inspect roles, orders, and requests.
        </p>
      </header>
      {error && (
        <p className="mb-4 border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <UserManagementTable
        users={users}
        loading={loading}
        search={search}
        role={role}
        onSearch={updateSearch}
        onRole={updateRole}
        selected={selected}
        onSelect={setSelected}
      />
      <AdminPagination
        page={page}
        total={total}
        pageSize={limit}
        onPage={setPage}
        disabled={loading}
      />
    </div>
  );
}
