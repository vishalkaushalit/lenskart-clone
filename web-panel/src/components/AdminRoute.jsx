import PopupMessage from "./PopupMessage";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { apiRequest, frontendUrl } from "../api";

export default function AdminRoute() {
  const [session, setSession] = useState({ loading: true, user: null, error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function checkSession() {
      setSession({ loading: true, user: null, error: "" });
      try {
        const data = await apiRequest("/auth/me", { signal: controller.signal });
        if (!controller.signal.aborted) setSession({ loading: false, user: data.user, error: "" });
      } catch (error) {
        if (!controller.signal.aborted) setSession({ loading: false, user: null, error: error.status === 401 ? "" : "Unable to check your session. Please try again." });
      }
    }
    checkSession();
    return () => controller.abort();
  }, [attempt]);

  if (session.loading) return <p role="status" className="p-8">Checking admin access...</p>;
  if (session.error) {
    return (
      <main className="p-8">
        <PopupMessage message={session.error} />
        <button type="button" onClick={() => setAttempt(attempt + 1)} className="mt-4 text-blue-600 underline">Try again</button>
      </main>
    );
  }
  if (!session.user || session.user.role !== "admin") {
    return (
      <main className="grid min-h-dvh place-content-center gap-4 p-8 text-center">
        <h1 className="text-2xl font-bold">Admin access required</h1>
        <p>Please log in with an admin account to open the web-panel.</p>
        <a href={`${frontendUrl}/login`} className="text-blue-600 underline">Go to login</a>
        <a href={frontendUrl} className="text-sm text-slate-500 underline">Back to store</a>
      </main>
    );
  }
  return <Outlet context={{ user: session.user, updateUser: (user) => setSession((previous) => ({ ...previous, user })) }} />;
}
