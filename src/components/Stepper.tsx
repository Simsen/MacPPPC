import { Fragment } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export type Step = 'build' | 'deploy';

interface Props {
  current: Step;
  onChange: (next: Step) => void;
  canDeploy: boolean;
}

const STEPS: Array<{ id: Step; label: string; hint: string }> = [
  { id: 'build', label: 'Build profiles', hint: 'Apps, permissions, metadata' },
  { id: 'deploy', label: 'Deploy to Intune', hint: 'Assignment & upload' },
];

export function Stepper({ current, onChange, canDeploy }: Props) {
  return (
    <nav className="flex items-center gap-4 mb-6" aria-label="Workflow steps">
      {STEPS.map((step, i) => {
        const active = step.id === current;
        const completed = step.id === 'build' && current === 'deploy';
        const enabled = step.id === 'build' || canDeploy;
        return (
          <Fragment key={step.id}>
            {i > 0 && (
              <div
                className={cn(
                  'flex-1 h-px min-w-6 transition-colors',
                  current === 'deploy' ? 'bg-primary/50' : 'bg-border-strong',
                )}
              />
            )}
            <button
              type="button"
              disabled={!enabled}
              onClick={() => enabled && onChange(step.id)}
              aria-current={active ? 'step' : undefined}
              className={cn(
                'group flex items-center gap-3 py-1.5 pr-2 rounded-lg transition text-left',
                !enabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              <span
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0 transition',
                  active && 'bg-primary text-primary-foreground shadow-sm ring-4 ring-primary/15',
                  completed && 'bg-primary/15 text-primary',
                  !active &&
                    !completed &&
                    'bg-card border border-border-strong text-muted-foreground group-enabled:group-hover:border-primary/50',
                )}
              >
                {completed ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
              </span>
              <div className="leading-tight">
                <div
                  className={cn(
                    'text-sm font-semibold',
                    active ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{step.hint}</div>
              </div>
            </button>
          </Fragment>
        );
      })}
    </nav>
  );
}
