import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await login(email, password);

      if (user.role === "admin") {
        const adminUrl = import.meta.env.VITE_ADMIN_URL;
        if (!adminUrl) {
          setError("The web-panel URL is not configured.");
          return;
        }
        window.location.assign(
          `${adminUrl.replace(/\/$/, "")}/dashboard`
        );
        return;
      }

      const from = location.state?.from;

      const destination =
        typeof from === "string" &&
        from.startsWith("/") &&
        !from.startsWith("//")
          ? from
          : "/";

      navigate(destination, { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6 sm:p-10 lg:w-1/2">
      <h1 className="text-3xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-gray-600">
        Log in to your account.
      </p>

      {location.state?.registered && (
        <p className="mt-4 text-green-700" role="status">
          Registration successful. Please log in.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="login-email"
            className="mb-2 block font-medium"
          >
            Email
          </label>

          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            placeholder="Enter your email"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="mb-2 block font-medium"
          >
            Password
          </label>

          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-700 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        Don't have an account?{" "}
        <Link
          to="/register"
          state={{ from: location.state?.from }}
          className="font-medium text-blue-700 hover:underline"
        >
          Register
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
