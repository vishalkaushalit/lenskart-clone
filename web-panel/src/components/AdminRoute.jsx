import Loader from './Loader';
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
      setSession(previous => ({ ...previous, loading: !previous.user, error: "" }));
      try {
        const data = await apiRequest("/auth/me", { signal: controller.signal });
        if (!controller.signal.aborted) setSession({ loading: false, user: data.user, error: "" });
      } catch (error) {
        if (!controller.signal.aborted) setSession({ loading: false, user: null, error: [401,403].includes(error.status) ? "" : "Unable to check your session. Please try again." });
      }
    }
    checkSession();
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    function expireSession() { setSession({ loading: false, user: null, error: "" }); }
    window.addEventListener('admin-session-expired', expireSession);
    return () => window.removeEventListener('admin-session-expired', expireSession);
  }, []);

  useEffect(() => {
    if (!session.loading && !session.error && (!session.user || session.user.role !== "admin")) {
      window.location.replace(`${frontendUrl}/login`);
    }
  }, [session]);

  if (session.loading) return <Loader label="Checking admin access"/>;
  if (session.error) {
    return (
      <main className="p-8">
        <PopupMessage message={session.error} />
        <button type="button" onClick={() => setAttempt(attempt + 1)} className="mt-4 text-blue-600 underline">Try again</button>
      </main>
    );
  }
  if (!session.user || session.user.role !== "admin") return <Loader label="Redirecting to login"/>;
  return <Outlet context={{ user: session.user, updateUser: (user) => setSession((previous) => ({ ...previous, user })) }} />;
}
