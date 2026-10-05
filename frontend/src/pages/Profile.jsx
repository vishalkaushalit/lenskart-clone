import Loader from '../components/Loader';
import PopupMessage from "../components/PopupMessage";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserRound, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/api";

function ProfileDetails({ user }) {
  const { updateProfile } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const saved = await updateProfile({ name, email });
      setName(saved.name);
      setEmail(saved.email);
      setSuccess("Your profile has been updated.");
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8" aria-labelledby="profile-details-heading">
      <h2 id="profile-details-heading" className="flex items-center gap-2 text-xl font-bold"><UserRound size={22} />Profile details</h2>
      <p className="mt-2 text-sm text-gray-500">Update your name and the email you use to log in.</p>
      <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-5">
        <div>
          <label htmlFor="profile-name" className="mb-2 block text-sm font-semibold">Name</label>
          <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} autoComplete="name" className="w-full rounded-lg border border-gray-300 px-4 py-3" />
        </div>
        <div>
          <label htmlFor="profile-email" className="mb-2 block text-sm font-semibold">Email</label>
          <input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} autoComplete="email" className="w-full rounded-lg border border-gray-300 px-4 py-3" />
        </div>
        {error && <PopupMessage message={error} onClose={() => setError("")} />}
        {success && <PopupMessage message={success} type="success" onClose={() => setSuccess("")} />}
        <button type="submit" disabled={saving} className="rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button>
      </form>
    </section>
  );
}

function OrderHistory() {
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ orders: [], hasMore: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadOrders() {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest(`/account/orders?page=${page}`, { signal: controller.signal });
        if (!controller.signal.aborted) setResult(data);
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadOrders();
    return () => controller.abort();
  }, [page, attempt]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8" aria-labelledby="order-history-heading">
      <h2 id="order-history-heading" className="flex items-center gap-2 text-xl font-bold"><Package size={22} />Order history</h2>
      <p className="mt-2 text-sm text-gray-500">Your recent orders and their status.</p>
      {loading ? <Loader label="Loading orders"/> : error ? (
        <div className="mt-6">
          <PopupMessage message={error} />
          <button type="button" onClick={() => setAttempt(attempt + 1)} className="mt-3 text-sm font-semibold underline">Try again</button>
        </div>
      ) : result.orders.length === 0 ? (
        <div className="py-10 text-center">
          <p className="font-semibold">{page === 1 ? "No orders yet" : "No orders on this page"}</p>
          <p className="mt-2 text-sm text-gray-500">Your orders will appear here after you place one.</p>
          <Link to="/" className="mt-5 inline-block rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white">Continue shopping</Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {result.orders.map((order) => (
            <li key={order._id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="break-all text-sm font-semibold">Order #{order._id}</p>
                  <p className="mt-1 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize">{order.status}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {order.items.map((item, index) => <li key={item._id || index}>{item.name} <span className="text-gray-500">× {item.quantity}</span></li>)}
              </ul>
              <p className="mt-4 text-right text-sm font-bold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: order.currency || "INR" }).format(order.totalAmount)}</p>
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && (page > 1 || result.hasMore) && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button type="button" disabled={!result.hasMore} onClick={() => setPage(page + 1)} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </section>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "orders", label: "Order History" },
  ];

  function handleTabKeyDown(event, index) {
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    setActiveTab(tabs[nextIndex].id);
    event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[nextIndex].focus();
  }

  return (
    <div className="bg-gray-50 py-10 sm:py-14">
      <div className="mx-auto w-[90%] max-w-5xl">
        <h1 className="text-3xl font-bold text-ink">My profile</h1>
        <p className="mt-2 text-sm text-gray-500">Manage your details and keep track of your orders.</p>
        <div role="tablist" aria-label="My account" className="mt-8 flex gap-2 border-b border-gray-200">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              id={`account-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`account-panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`border-b-2 px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${activeTab === tab.id ? "border-ink text-ink" : "border-transparent text-gray-500 hover:text-ink"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-6">
          <div id="account-panel-profile" role="tabpanel" aria-labelledby="account-tab-profile" tabIndex={0} hidden={activeTab !== "profile"}>
            <ProfileDetails key={user.id} user={user} />
          </div>
          <div id="account-panel-orders" role="tabpanel" aria-labelledby="account-tab-orders" tabIndex={0} hidden={activeTab !== "orders"}>
            <OrderHistory key={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
