type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  order_count: number;
  coupon_count: number;
  role_request_count: number;
};

export function UserManagementTable({
  users,
  loading,
  search,
  role,
  onSearch,
  onRole,
  selected,
  onSelect,
}: {
  users: AdminUser[];
  loading: boolean;
  search: string;
  role: string;
  onSearch: (value: string) => void;
  onRole: (value: string) => void;
  selected: AdminUser | null;
  onSelect: (user: AdminUser | null) => void;
}) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold">Users</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Search customers, owners, riders, and admins.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search name, email, phone"
            className="h-10 w-64 border border-border bg-card px-3 text-sm"
          />
          <select
            value={role}
            onChange={(event) => onRole(event.target.value)}
            className="h-10 border border-border bg-card px-3 text-sm"
          >
            <option value="">All roles</option>
            <option value="customer">Customers</option>
            <option value="owner">Owners</option>
            <option value="rider">Riders</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-190 text-left text-sm">
          <thead className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Coupons</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                onClick={() => onSelect(user)}
                className="cursor-pointer border-b border-border last:border-0 hover:bg-secondary/40"
              >
                <td className="px-4 py-4">
                  <strong>{user.name}</strong>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {user.email} · {user.phone || "No phone"}
                  </span>
                </td>
                <td className="px-4 py-4">{user.role}</td>
                <td className="px-4 py-4">{user.order_count}</td>
                <td className="px-4 py-4">{user.coupon_count}</td>
                <td className="px-4 py-4">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {!loading && !users.length && (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-sm text-muted-foreground"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && (
          <p className="p-4 text-sm text-muted-foreground">Loading users...</p>
        )}
      </div>
      {selected && (
        <div className="mt-4 border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold">{selected.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {selected.email} · {selected.phone || "No phone"}
              </p>
            </div>
            <button
              onClick={() => onSelect(null)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
