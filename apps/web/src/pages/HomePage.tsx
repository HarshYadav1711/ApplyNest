import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";

export function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          ApplyNest
        </p>
        <h1 className="mt-1 text-lg font-semibold text-slate-900">
          Signed in
        </h1>
        <p className="mt-2 text-sm text-slate-600">{user?.email}</p>
        <Button className="mt-6" variant="secondary" type="button" onClick={logout}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
