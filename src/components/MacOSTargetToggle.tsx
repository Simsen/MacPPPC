import { Laptop, Undo2, X, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { Card, Choice } from './Card';
import type { MacOSTarget } from '@/lib/types';
import type { ConversionReport } from '@/lib/osTarget';

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
      <div className="px-6 pt-5 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <Laptop className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-[15px] font-semibold tracking-tight">Target macOS</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {OPTIONS.map((o) => (
            <Choice
              key={o.value}
              active={value === o.value}
              onClick={() => onChange(o.value)}
              title={o.title}
              subtitle={o.subtitle}
            />
          ))}
        </div>

        {report && (
          <div className="mt-4 rounded-lg border border-info/25 bg-info/[0.06] p-4 text-xs space-y-3">
            <div className="flex items-start gap-2.5">
              <ArrowRightLeft className="w-4 h-4 text-info mt-px flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold">
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
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-card border border-border font-medium text-info hover:border-info/40 transition"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Undo
                </button>
              )}
              <button
                type="button"
                onClick={onDismissReport}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-card/60 transition"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {report.moved.length > 0 && (
              <ul className="ml-6 text-muted-foreground list-disc list-outside pl-3.5 space-y-0.5">
                {report.moved.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            )}
            {report.dropped.length > 0 && (
              <div className="ml-6 p-3 rounded-md border border-warning/30 bg-warning/10 text-warning">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Not possible on macOS {report.to}, removed:
                </div>
                <ul className="list-disc list-outside pl-5 mt-1.5 space-y-0.5">
                  {report.dropped.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
