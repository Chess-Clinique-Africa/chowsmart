import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database } from 'lucide-react';
import { adminService } from '@/services/admin';
import { Button } from '@/components/UI/Button';
import { ErrorState } from '@/components/UI/ErrorState';
import { useAuth } from '@/context/AuthContext';

export function DatabaseSetup() {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [log, setLog] = useState('');

  useEffect(() => {
    adminService
      .bootstrapStatus()
      .then((data) => {
        setAllowed(data.bootstrapAllowed);
        if (!data.bootstrapAllowed && isAdmin) {
          navigate('/admin', { replace: true });
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not check database status'))
      .finally(() => setChecking(false));
  }, [isAdmin, navigate]);

  async function runSetup() {
    if (
      !window.confirm(
        'Migrate and seed the database? This creates tables and loads demo data (and demo admin/user accounts).'
      )
    ) {
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    setLog('');
    try {
      const result = await adminService.setupDatabase();
      setMessage(result.message);
      setLog([result.migrateOutput, result.seedOutput, result.output].filter(Boolean).join('\n\n'));
      setAllowed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <section className="page-shell py-16">
        <p className="text-muted">Checking database status…</p>
      </section>
    );
  }

  if (!allowed) {
    return (
      <section className="page-shell max-w-xl py-16">
        <h1 className="font-extrabold tracking-tight text-3xl">Database already set up</h1>
        <p className="mt-3 text-muted">
          Bootstrap is only available when there are no users yet. Sign in as an admin to migrate or
          re-seed from the dashboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {isAuthenticated ? (
            <Link to="/admin">
              <Button>Open admin</Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button>Log in</Button>
            </Link>
          )}
          <Link to="/">
            <Button variant="outline">Home</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell max-w-2xl py-16">
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <Database size={14} aria-hidden />
        First-time setup
      </p>
      <h1 className="font-extrabold tracking-tight text-4xl">Prepare the database</h1>
      <p className="mt-3 text-muted">
        This runs Prisma migrate and seed on the API server using its{' '}
        <code className="text-ink">DATABASE_URL</code> (for example your Neon database). Use this when
        the database is empty and you cannot reach it from your laptop.
      </p>

      {error ? (
        <div className="mt-6">
          <ErrorState message={error} />
        </div>
      ) : null}
      {message ? <p className="mt-6 text-sm text-success">{message}</p> : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button disabled={busy} onClick={() => void runSetup()}>
          {busy ? 'Migrating & seeding…' : 'Migrate + seed'}
        </Button>
        <Link to="/login">
          <Button variant="outline" disabled={busy}>
            Go to login
          </Button>
        </Link>
      </div>

      {log ? (
        <pre className="mt-6 max-h-64 overflow-auto rounded-xl border border-line bg-bg-elevated p-4 text-xs leading-relaxed text-muted whitespace-pre-wrap">
          {log}
        </pre>
      ) : null}

      <p className="mt-6 text-xs text-muted">
        After seeding, log in with <strong>admin@chowsmart.app</strong> / <strong>Admin123!</strong>
      </p>
    </section>
  );
}
