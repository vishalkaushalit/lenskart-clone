import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { Pencil, Trash2, Plus, Search, RefreshCw } from "lucide-react";
import NotificationPopup from "../components/NotificationPopup";
import UserActionDialog from "../components/UserActionDialog";
import DashboardLayout from "../components/DashboardLayout";
import Pagination from "../components/Pagination";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import { apiRequest } from "../api";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata",
});

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export default function Users() {
  const { user: currentUser, updateUser } = useOutletContext();
  const [action, setAction] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageValue = Number(searchParams.get("page") || 1);
  const page = Number.isSafeInteger(pageValue) && pageValue >= 1 && pageValue <= 10000 ? pageValue : 1;
  function setPage(value) {
    setSearchParams((previous) => { const next = new URLSearchParams(previous); next.set("page", String(value)); return next; });
  }
  const limit = 20;
  const search = searchParams.get("search") || "";
  function setSearch(value) {
    setSearchParams((previous) => { const next = new URLSearchParams(previous); if (value) next.set("search", value); else next.delete("search"); next.delete("page"); return next; }, { replace: true });
  }
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ loading: true, error: "", users: [], pagination: null });

  useEffect(() => {
    const controller = new AbortController();
    async function loadUsers() {
      setResult((previous) => ({ ...previous, loading: true, error: "" }));
      try {
        const data = await apiRequest(`/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${status}&sort=${sort}`, { signal: controller.signal });
        if (controller.signal.aborted) return;
        const lastPage = Math.max(1, Math.min(data.pagination.totalPages, 10000));
        if (page > lastPage) {
          setSearchParams((previous) => { const next = new URLSearchParams(previous); next.set("page", String(lastPage)); return next; }, { replace: true });
          return;
        }
        setResult({ loading: false, error: "", users: data.users, pagination: data.pagination, counts: data.counts });
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({ loading: false, error: error.message, users: [], pagination: null });
          setNotification({ type: "error", message: error.message });
        }
      }
    }
    loadUsers();
    const refresh = setInterval(loadUsers, 30000);
    return () => { controller.abort(); clearInterval(refresh); };
  }, [page, limit, attempt, search, status, sort, setSearchParams]);

  const { loading, error, users, pagination } = result;

  return (
    <DashboardLayout>
      <main className="admin-page">
        <PageHeader title="Users" description="Manage your customers">
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" disabled={loading} onClick={() => setAttempt((previous) => previous + 1)} aria-label="Refresh users" className="admin-button-secondary"><RefreshCw size={18} className={loading ? "animate-spin motion-reduce:animate-none" : ""} /><span className="hidden sm:inline">Refresh</span></button>
            <button onClick={() => { setNotification(null); setAction({ type: "create", user: { name: "", email: "", role: "customer" } }); }} className="admin-button-primary"><Plus size={20} />Add User</button>
          </div>
        </PageHeader>


        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="flex flex-1 rounded-xl border border-slate-100 bg-white" role="tablist" aria-label="User status">
            {[["", "All", "all"], ["active", "Active", "active"], ["inactive", "Inactive", "inactive"]].map(([value, label, key]) => <button key={key} role="tab" aria-selected={status === value} onClick={() => { setStatus(value); setPage(1); }} className={`flex-1 border-b-3 px-5 py-5 text-sm font-semibold ${status === value ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}>{label} ({result.counts?.[key]?.toLocaleString() ?? "—"})</button>)}
          </div>
          <div className="flex flex-1 flex-wrap gap-3 rounded-xl bg-white p-2">
            <label className="flex min-w-48 flex-1 items-center gap-3 rounded-lg border border-slate-200 px-4"><Search size={20} className="text-slate-400" /><input aria-label="Search users" placeholder="Search users..." value={search} maxLength={100} onChange={(event) => { setSearch(event.target.value); }} className="w-full py-3 text-sm outline-none" /></label>
            <select aria-label="Sort users" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              <option value="newest">Joined: Newest first</option>
              <option value="oldest">Joined: Oldest first</option>
              <option value="name-asc">Name: A–Z</option>
              <option value="name-desc">Name: Z–A</option>
            </select>
            <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
          </div>
        </div>

        <DataTable label="Users" footer={pagination && !loading && !error && <Pagination page={page} pageSize={limit} total={pagination.total} onPageChange={setPage} label="users" />}>
          <thead>
            <tr>
              <th scope="col">Sr. No.</th>
              <th scope="col">Name</th>
              <th scope="col">User ID</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Status</th>
              <th scope="col">Joined On</th>
              <th scope="col" className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center"><Loader label="Loading users"/></td></tr>
            ) : error ? (
              <tr><td colSpan={8} className="text-center">
                <div className="py-8">
                  <button type="button" onClick={() => setAttempt(attempt + 1)} className="mt-3 font-medium text-blue-600 hover:underline">Try again</button>
                </div>
              </td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={8} className="text-center"><p className="py-8 text-slate-500">No users found.</p></td></tr>
            ) : users.map((user, index) => (
              <tr key={user.id}>
                <td className="font-medium text-slate-700">{(page - 1) * limit + index + 1}</td>
                <td>
                  <div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">{user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span><p className="font-medium text-slate-800">{user.name}</p></div>
                </td>
                <td className="font-medium text-slate-700">{user.userId ?? "—"}</td>
                <td className="text-slate-600">{user.email}</td>
                <td className="whitespace-nowrap text-slate-600">{user.phone || "—"}</td>
                <td><StatusBadge status={user.status||'active'}/></td>
                <td className="whitespace-nowrap text-slate-600">{formatDate(user.createdAt)}</td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button type="button" aria-label={`Edit ${user.name}`} title="Edit user" onClick={() => { setNotification(null); setAction({ type: "edit", user }); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50"><Pencil size={16} /></button>
                    <button type="button" aria-label={`Delete ${user.name}`} title={user.id === currentUser.id ? "You cannot delete your own account" : "Delete user"} disabled={user.id === currentUser.id} onClick={() => { setNotification(null); setAction({ type: "delete", user }); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </main>
      {action && <UserActionDialog key={`${action.type}-${action.user.id}`} action={action} currentUserId={currentUser.id} onClose={() => setAction(null)} onError={(message) => setNotification({ type: "error", message })} onSuccess={(savedUser) => {
        if (savedUser?.id === currentUser.id) updateUser(savedUser);
        setNotification({ type: "success", message: savedUser ? (action.type === "create" ? "User added successfully." : "User updated successfully.") : "User deleted successfully." });
        setAction(null);
        setAttempt((previous) => previous + 1);
      }} />}
      {notification && <NotificationPopup notification={notification} onClose={() => setNotification(null)} />}
    </DashboardLayout>
  );
}
