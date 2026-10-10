import { useState } from 'react';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import type {
  AppleEventReceiver,
  Authorization,
  KnownApp,
} from '@/lib/types';

interface Props {
  receivers: AppleEventReceiver[];
  /** Known-apps list for the bundle-ID picker; lifted from App.tsx so that
   *  the editor re-renders when the async load completes. */
  knownApps: KnownApp[];
  onChange: (next: AppleEventReceiver[]) => void;
}

function emptyReceiver(): AppleEventReceiver {
  return {
    identifier: '',
    identifierType: 'bundleID',
    codeRequirement: '',
    authorization: 'Allow',
  };
}

/** Find a matching known app by bundle ID and return its codeRequirement, or null. */
function lookupKnownCodeRequirement(
  bundleId: string,
  knownApps: KnownApp[],
): string | null {
  const match = knownApps.find((a) => a.bundleId === bundleId);
  return match?.codeRequirement ?? null;
}

export function AppleEventReceiverEditor({ receivers, knownApps, onChange }: Props) {
  const [pickerOpenFor, setPickerOpenFor] = useState<number | null>(null);

  function update(idx: number, patch: Partial<AppleEventReceiver>) {
    onChange(receivers.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function remove(idx: number) {
    onChange(receivers.filter((_, i) => i !== idx));
  }

  function add() {
    onChange([...receivers, emptyReceiver()]);
  }

  function pickKnown(idx: number, app: KnownApp) {
    update(idx, {
      identifier: app.bundleId,
      identifierType: 'bundleID',
      codeRequirement: app.codeRequirement,
    });
    setPickerOpenFor(null);
  }

  function applyKnownIfMatch(idx: number, bundleId: string) {
    const cr = lookupKnownCodeRequirement(bundleId, knownApps);
    if (cr) update(idx, { identifier: bundleId, codeRequirement: cr });
    else update(idx, { identifier: bundleId });
  }

  return (
    <div className="ml-12 mt-2 space-y-2">
      {receivers.length === 0 && (
        <p className="text-[11px] text-amber-500/90">
          Add at least one receiver app — AppleEvents entries without a receiver
          are dropped from the generated profile.
        </p>
      )}

      {receivers.map((r, idx) => (
        <div
          key={idx}
          className="rounded-lg border border-border bg-card-elevated/40 p-2.5 space-y-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium w-24 shrink-0">
              Receiver #{idx + 1}
            </span>
            <select
              value={r.identifierType}
              onChange={(e) =>
                update(idx, {
                  identifierType: e.target.value as 'bundleID' | 'path',
                })
              }
              className="text-[11px] bg-input border border-border rounded px-1.5 py-1"
            >
              <option value="bundleID">bundleID</option>
              <option value="path">path</option>
            </select>
            <select
              value={r.authorization}
              onChange={(e) =>
                update(idx, { authorization: e.target.value as Authorization })
              }
              className="text-[11px] bg-input border border-border rounded px-1.5 py-1 ml-auto"
            >
              <option value="Allow">Allow</option>
              <option value="AllowStandardUserToSetSystemService">
                Allow standard user
              </option>
              <option value="Deny">Deny</option>
            </select>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-muted-foreground hover:text-destructive transition p-1"
              aria-label="Remove receiver"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={r.identifier}
              onChange={(e) => applyKnownIfMatch(idx, e.target.value)}
              placeholder={
                r.identifierType === 'bundleID'
                  ? 'com.apple.finder'
                  : '/System/Applications/Finder.app'
              }
              className="flex-1 text-[12px] font-mono bg-input border border-border rounded px-2 py-1.5"
            />
            {knownApps.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setPickerOpenFor(pickerOpenFor === idx ? null : idx)
                  }
                  className="px-2 py-1.5 rounded border border-border hover:bg-card-elevated text-muted-foreground hover:text-foreground transition"
                  title="Pick from known apps"
                  aria-label="Pick from known apps"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                {pickerOpenFor === idx && (
                  <div className="absolute right-0 top-full mt-1 z-20 w-72 max-h-64 overflow-auto rounded-md border border-border bg-card shadow-[var(--shadow-lift)]">
                    {knownApps.map((app) => (
                      <button
                        key={app.bundleId}
                        type="button"
                        onClick={() => pickKnown(idx, app)}
                        className="block w-full text-left px-3 py-2 text-xs hover:bg-card-elevated transition"
                      >
                        <div className="font-medium truncate">
                          {app.displayName}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono truncate">
                          {app.bundleId}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <textarea
            value={r.codeRequirement}
            onChange={(e) => update(idx, { codeRequirement: e.target.value })}
            rows={2}
            placeholder={
              r.identifier
                ? `identifier "${r.identifier}" and anchor apple generic`
                : 'Designated code requirement for the receiver app'
            }
            className="w-full text-[11px] font-mono bg-input border border-border rounded px-2 py-1.5 resize-y"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition"
      >
        <Plus className="w-3.5 h-3.5" />
        Add receiver
      </button>
    </div>
  );
}
