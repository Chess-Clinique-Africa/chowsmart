import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/UI/Input';
import { Button } from '@/components/UI/Button';
import { useAuth } from '@/context/AuthContext';
import { ApiClientError } from '@/services/api';
import { useState } from 'react';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, 'At least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

export function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setError('');
    try {
      await registerUser(values.name, values.email, values.password);
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Registration failed');
    }
  }

  return (
    <section className="page-shell flex justify-center py-16">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-4 rounded-3xl border border-line bg-bg-elevated p-8 shadow-soft"
      >
        <div>
          <h1 className="font-extrabold tracking-tight text-3xl">Join ChowSmart</h1>
          <p className="mt-2 text-sm text-muted">Save favorites and build menus across the catalogue.</p>
        </div>
        <Input label="Name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input
          label="Password"
          type="password"
          error={errors.password?.message}
          {...register('password')}
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-bright underline">
            Sign in
          </Link>
        </p>
      </form>
    </section>
  );
}
