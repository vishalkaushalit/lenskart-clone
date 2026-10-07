import PopupMessage from "../components/PopupMessage";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import LoginImage from "../components/LoginImage";

export default function Register() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    if (fields.password !== fields.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(fields),
      });
      navigate("/login", {
        replace: true,
        state: { registered: true, from: location.state?.from },
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="w-full py-4 sm:py-6">
      <div className="store-container flex flex-col overflow-hidden rounded-lg bg-white shadow-2xl lg:flex-row">
        <LoginImage />
        <div className="w-full p-6 sm:p-8 lg:w-1/2">
          <h1 className="text-3xl font-semibold">Create an account</h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {[
              { name: "name", label: "Name", type: "text", autoComplete: "name", maxLength: 100 },
              { name: "email", label: "Email", type: "email", autoComplete: "email", maxLength: 254 },
              { name: "password", label: "Password", type: "password", autoComplete: "new-password", minLength: 8 },
              { name: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password", minLength: 8 },
            ].map(({ label, name, ...props }) => (
              <div key={name}>
                <label htmlFor={`register-${name}`} className="mb-1 block font-medium">{label}</label>
                <input {...props} id={`register-${name}`} name={name} required className="w-full rounded-lg border border-gray-300 px-4 py-2.5" />
              </div>
            ))}
            {error && <PopupMessage message={error} onClose={() => setError("")} />}
            <button disabled={submitting} type="submit" className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:opacity-50">
              {submitting ? "Registering..." : "Register"}
            </button>
          </form>
          <p className="mt-4 text-center text-gray-600">
            Already have an account? <Link to="/login" state={{ from: location.state?.from }} className="font-medium text-blue-700 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
