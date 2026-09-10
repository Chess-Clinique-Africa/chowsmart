import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/components/UI/Input';
import { Button } from '@/components/UI/Button';
import { useAuth } from '@/context/AuthContext';
import { ApiClientError } from '@/services/api';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const from = (location.state as { from?: string } | null)?.from || '/';

  async function onSubmit(values: FormValues) {
    setError('');
    try {
      const user = await login(values.email, values.password);
      const destination = user.role === 'ADMIN' ? '/admin' : from === '/' ? '/profile' : from;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Login failed');
    }
  }

  return (
    <section className="page-shell flex justify-center py-16">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-4 rounded-3xl border border-line bg-bg-elevated p-8 shadow-soft"
      >
        <div>
          <h1 className="font-extrabold tracking-tight text-3xl text-center">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">Sign in to save menus and favorites.</p>
        </div>
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input
          label="Password"
          type="password"
          error={errors.password?.message}
          {...register('password')}
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
        <p className="text-center text-sm text-muted">
          New here?{' '}
          <Link to="/register" className="text-accent-bright underline">
            Create an account
          </Link>
        </p>
        <p className="text-center text-xs text-muted">
          Demo admin: admin@chowsmart.app / Admin123!
          <br />
          Demo user: user@chowsmart.app / User1234!
          <br />
          Empty database?{' '}
          <Link to="/setup" className="underline">
            Run migrate + seed
          </Link>
        </p>
      </form>
    </section>
  );
}
