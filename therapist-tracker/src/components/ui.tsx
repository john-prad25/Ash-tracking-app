import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-3xl border bg-[var(--color-surface)] p-5 shadow-sm shadow-stone-200/50',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardTitle({
  children,
  subtitle,
}: {
  children: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-[var(--color-ink)]">{children}</h2>
      {subtitle ? <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p> : null}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[var(--color-ink)]">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="min-h-28 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
    />
  );
}

export function Button({
  children,
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-[var(--color-accent)] text-white hover:brightness-110',
        variant === 'secondary' &&
          'border bg-white text-[var(--color-ink)] hover:border-[var(--color-accent)]',
        variant === 'ghost' && 'text-[var(--color-muted)] hover:bg-stone-100 hover:text-[var(--color-ink)]',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'warm';
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
        tone === 'neutral' && 'bg-stone-100 text-stone-700',
        tone === 'accent' && 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
        tone === 'warm' && 'bg-amber-50 text-amber-800',
      )}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl border bg-[var(--color-surface)] p-5 shadow-sm">
      <p className="text-sm text-[var(--color-muted)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">{value}</p>
      {hint ? <p className="mt-2 text-xs text-[var(--color-muted)]">{hint}</p> : null}
    </div>
  );
}
