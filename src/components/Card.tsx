import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Card({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn('mb-5', className)}>
      {label && <div className="section-label mb-2 px-1">{label}</div>}
      <section className="rounded-xl border border-border bg-card shadow-[var(--shadow-soft)] overflow-hidden">
        {children}
      </section>
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

export function CardHeader({
  icon,
  title,
  subtitle,
  actions,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border">
      {icon && (
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/15 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h2 className="text-[15px] font-semibold leading-tight tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {actions}
    </div>
  );
}

export function Choice({
  active,
  onClick,
  icon,
  title,
  subtitle,
  compact,
}: {
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'group relative flex items-start gap-3 rounded-lg border text-left transition',
        compact ? 'p-2.5 pr-8' : 'p-3.5 pr-9',
        active
          ? 'border-primary/60 bg-primary/[0.06] ring-1 ring-primary/40'
          : 'border-border bg-card hover:border-border-strong hover:bg-card-elevated/50',
      )}
    >
      {icon && (
        <div
          className={cn(
            'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition',
            compact && 'w-7 h-7',
            active ? 'bg-primary/15 text-primary' : 'bg-muted/70 text-muted-foreground',
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'font-medium leading-tight',
            compact ? 'text-[13px]' : 'text-sm',
            active && 'text-primary',
          )}
        >
          {title}
        </div>
        {subtitle && (
          <div className="text-[11px] text-muted-foreground mt-1 truncate">{subtitle}</div>
        )}
      </div>
      <span
        className={cn(
          'absolute right-3 w-4 h-4 rounded-full flex items-center justify-center transition',
          compact ? 'top-2.5' : 'top-3.5',
          active
            ? 'bg-primary text-primary-foreground'
            : 'border border-border-strong group-hover:border-muted-foreground/60',
        )}
      >
        {active && <Check className="w-2.5 h-2.5" strokeWidth={3.5} />}
      </span>
    </button>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={cn(
        'relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-muted ring-1 ring-inset ring-border-strong/60',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
