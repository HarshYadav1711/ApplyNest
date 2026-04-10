import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { getApiErrorMessage } from "../utils/apiError";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, isBootstrapping } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await register(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create account."));
    } finally {
      setPending(false);
    }
  }

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
        <Spinner />
        <p className="text-sm">Checking your session…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          ApplyNest
        </p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          Create account
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Password must be at least 8 characters.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="text-xs font-medium text-slate-600"
              htmlFor="register-email"
            >
              Email
            </label>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              className="mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
            />
          </div>
          <div>
            <label
              className="text-xs font-medium text-slate-600"
              htmlFor="register-password"
            >
              Password
            </label>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-medium text-slate-900 underline" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
