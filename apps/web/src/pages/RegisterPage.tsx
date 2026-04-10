import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthPageLayout } from "../components/layout/AuthPageLayout";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PageLoading } from "../components/ui/PageStatus";
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
    return <PageLoading message="Checking your session…" className="min-h-screen" />;
  }

  return (
    <AuthPageLayout
      title="Create account"
      description="Choose an email and a password of at least eight characters."
      footer={
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            className="font-medium text-slate-900 underline decoration-slate-400 underline-offset-2 hover:decoration-slate-900"
            to="/login"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
            className="mt-1.5"
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
            className="mt-1.5"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
          />
        </div>
        {error ? <Alert variant="danger">{error}</Alert> : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthPageLayout>
  );
}
