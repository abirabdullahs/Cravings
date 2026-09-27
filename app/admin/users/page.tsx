"use client";

import { useEffect, useState } from "react";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import type { AdminUser } from "@/types/admin-types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<AdminUser | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      async function load() {
        setLoading(true);
        const query = new URLSearchParams({ role, search });
        const response = await fetch(`/api/admin/users?${query}`);
        if (response.ok) setUsers((await response.json()).users ?? []);
        setLoading(false);
      }
      void load();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [role, search]);

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
      <UserManagementTable
        users={users}
        loading={loading}
        search={search}
        role={role}
        onSearch={setSearch}
        onRole={setRole}
        selected={selected}
        onSelect={setSelected}
      />
    </div>
  );
}
