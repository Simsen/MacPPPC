import { Laptop, Undo2, X, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { Card } from './Card';
import type { MacOSTarget } from '@/lib/types';
import type { ConversionReport } from '@/lib/osTarget';
import { cn } from '@/lib/cn';

interface Props {
  value: MacOSTarget;
  onChange: (next: MacOSTarget) => void;
  report: ConversionReport | null;
  canUndo: boolean;
  onUndo: () => void;
  onDismissReport: () => void;
}

const OPTIONS: { value: MacOSTarget; title: string; subtitle: string }[] = [
  {
    value: '26',
    title: 'macOS 26 and earlier',
    subtitle: 'PPPC only · .mobileconfig or Settings Catalog',
  },
  {
    value: '27',
    title: 'macOS 27',
    subtitle: 'PPPC + DDM App Privacy & Safari Privacy',
  },
];

export function MacOSTargetToggle({
  value,
  onChange,
  report,
  canUndo,
  onUndo,
  onDismissReport,
}: Props) {
  return (
    <Card>
      <div className="px-5 py-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Laptop className="w-3.5 h-3.5 text-muted-foreground" />
          <div className="section-label">Target macOS</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              aria-pressed={value === o.value}
              className={cn(
                'p-3 rounded-md border text-left transition',
                value === o.value
                  ? 'border-primary/50 bg-primary/8 ring-1 ring-primary/40'
                  : 'border-border/60 hover:bg-card-elevated/60',
              )}
            >
              <div className="text-sm font-medium">{o.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {o.subtitle}
              </div>
            </button>
          ))}
        </div>
      </div>

      {report && (
        <div className="border-t border-border/60 px-5 py-3 bg-card-elevated/30 text-xs space-y-2">
          <div className="flex items-start gap-2">
            <ArrowRightLeft className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium">
                Converted to macOS {report.to}: {report.moved.length} moved
                {report.dropped.length > 0 && `, ${report.dropped.length} dropped`}
              </div>
              {report.moved.length === 0 && report.dropped.length === 0 && (
                <div className="text-muted-foreground mt-0.5">
                  Nothing needed converting.
                </div>
              )}
            </div>
            {canUndo && (
              <button
                type="button"
                onClick={onUndo}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border/60 hover:bg-card-elevated transition"
              >
                <Undo2 className="w-3 h-3" />
                Undo
              </button>
            )}
            <button
              type="button"
              onClick={onDismissReport}
              className="text-muted-foreground hover:text-foreground p-0.5"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {report.moved.length > 0 && (
            <ul className="ml-5 text-muted-foreground list-disc list-inside">
              {report.moved.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
          {report.dropped.length > 0 && (
            <div className="ml-5 p-2 rounded-md bg-warning/10 text-warning">
              <div className="flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                Not possible on macOS {report.to}, removed:
              </div>
              <ul className="list-disc list-inside mt-1">
                {report.dropped.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
