import PopupMessage from "../components/PopupMessage";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest, frontendUrl } from "../api";

export default function Logout() {
  const requestRef = useRef(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    // Reuse the request during StrictMode's effect replay.
    requestRef.current ??= apiRequest("/auth/logout", { method: "POST" });
    requestRef.current.then(() => {
      if (active) window.location.replace(`${frontendUrl}/login`);
    }).catch((error) => {
      if (active) setError(error.message);
    });
    return () => { active = false; };
  }, [attempt]);

  function retry() {
    requestRef.current = null;
    setError("");
    setAttempt(attempt + 1);
  }

  return (
    <main className="grid min-h-dvh place-content-center gap-4 p-8 text-center">
      {error ? (
        <>
          <h1 className="text-2xl font-bold">Unable to log out</h1>
          <PopupMessage message={error} />
          <button type="button" onClick={retry} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white">Try again</button>
          <Link to="/dashboard" className="text-sm text-blue-600 underline">Back to dashboard</Link>
        </>
      ) : <p role="status">Logging out...</p>}
    </main>
  );
}
