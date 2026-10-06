import PopupMessage from "../components/PopupMessage";
import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import DashboardLayout from "../components/DashboardLayout";
import { apiRequest } from "../api";

export default function Profile() {
  const { user, updateUser } = useOutletContext();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const data = await apiRequest("/account/profile", {
        method: "PATCH", body: JSON.stringify({ name, email }),
      });
      updateUser(data.user);
      setName(data.user.name);
      setEmail(data.user.email);
      setSuccess("Your profile has been updated.");
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <main className="admin-page">
        <PageHeader title="Edit profile" description="Update your name and login email."><Link to="/profile" className="admin-button-secondary">Back to profile</Link></PageHeader>
        <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div>
            <label htmlFor="admin-profile-name" className="mb-2 block text-sm font-semibold">Name</label>
            <input id="admin-profile-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={100} required className="admin-field" />
          </div>
          <div>
            <label htmlFor="admin-profile-email" className="mb-2 block text-sm font-semibold">Email</label>
            <input id="admin-profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={254} required className="admin-field" />
          </div>
          {error && <PopupMessage message={error} onClose={() => setError("")} />}
          {success && <PopupMessage message={success} type="success" onClose={() => setSuccess("")} />}
          <button type="submit" disabled={saving} className="admin-button-primary">{saving ? "Saving..." : "Save changes"}</button>
        </form>
      </main>
    </DashboardLayout>
  );
}
