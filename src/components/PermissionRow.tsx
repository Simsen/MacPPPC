import { useState } from 'react';
import { Info } from 'lucide-react';
import type {
  Authorization,
  AuthMode,
  AppleEventReceiver,
  KnownApp,
  PermissionState,
  PppcPermission,
} from '@/lib/types';
import { cn } from '@/lib/cn';
import { AppleEventReceiverEditor } from './AppleEventReceiverEditor';

interface Props {
  perm: PppcPermission;
  state: PermissionState;
  /** Forwarded to AppleEventReceiverEditor for the bundle-ID picker. */
  knownApps: KnownApp[];
  onChange: (next: PermissionState) => void;
}

/** Which Authorization values the dropdown should expose for this authMode. */
function allowedAuthValues(mode: AuthMode): Authorization[] {
  switch (mode) {
    case 'standard':
      return ['Allow', 'AllowStandardUserToSetSystemService', 'Deny'];
    case 'denyOrStandardUser':
      return ['AllowStandardUserToSetSystemService', 'Deny'];
    case 'denyOnly':
      return ['Deny'];
  }
}

const AUTH_LABELS: Record<Authorization, string> = {
  Allow: 'Allow',
  AllowStandardUserToSetSystemService: 'Allow standard user',
  Deny: 'Deny',
};

/** Pick the closest valid Authorization for the dropdown's effective value. */
function clampForMode(mode: AuthMode, requested: Authorization): Authorization {
  const allowed = allowedAuthValues(mode);
  if (allowed.includes(requested)) return requested;
  // Prefer the most permissive remaining choice.
  return allowed[0];
}

export function PermissionRow({ perm, state, knownApps, onChange }: Props) {
  const [showTip, setShowTip] = useState(false);
  const isAppleEvents = perm.tccService === 'AppleEvents';

  function toggle() {
    onChange({ ...state, enabled: !state.enabled });
  }

  function setAuth(auth: Authorization) {
    onChange({ ...state, authorization: auth });
  }

  function setReceivers(next: AppleEventReceiver[]) {
    onChange({ ...state, receivers: next });
  }

  const allowed = allowedAuthValues(perm.authMode);
  const effectiveAuth = clampForMode(perm.authMode, state.authorization);

  return (
    <div className="p-3 rounded-md hover:bg-background/30 transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              role="switch"
              aria-checked={state.enabled}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition',
                state.enabled ? 'bg-primary' : 'bg-muted',
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition',
                  state.enabled ? 'translate-x-4' : 'translate-x-0.5',
                )}
              />
            </button>
            <span className="font-medium">{perm.name}</span>
            <span className="text-[10px] font-mono text-muted-foreground/70 px-1 py-0.5 rounded bg-muted/30">
              {perm.tccService}
            </span>
            {perm.minMacOS && (
              <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-medium">
                macOS {perm.minMacOS}+
              </span>
            )}
            {perm.deprecatedIn && (
              <span
                className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium"
                title={`Deprecated by Apple in macOS ${perm.deprecatedIn}`}
              >
                Deprecated · macOS {perm.deprecatedIn}
              </span>
            )}
            {perm.ddmReplacement && (
              <span
                className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                title="Deprecated in macOS 27 — switch the target to macOS 27 to use DDM App Privacy instead"
              >
                macOS 27 → App Privacy
              </span>
            )}
            {perm.tooltip && (
              <button
                type="button"
                onMouseEnter={() => setShowTip(true)}
                onMouseLeave={() => setShowTip(false)}
                onFocus={() => setShowTip(true)}
                onBlur={() => setShowTip(false)}
                className="text-muted-foreground hover:text-foreground relative"
                aria-label="More info"
              >
                <Info className="w-4 h-4" />
                {showTip && (
                  <span className="absolute left-6 top-0 z-10 w-72 p-2 rounded-md bg-card border border-border shadow-lg text-xs text-foreground">
                    {perm.tooltip}
                  </span>
                )}
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-12">
            {perm.description}
          </p>
        </div>
        {state.enabled && !isAppleEvents && (
          <select
            value={effectiveAuth}
            disabled={perm.authMode === 'denyOnly'}
            onChange={(e) => setAuth(e.target.value as Authorization)}
            className="text-sm bg-background border border-border rounded-md px-2 py-1.5 min-w-[180px] disabled:opacity-60"
          >
            {allowed.map((value) => (
              <option key={value} value={value}>
                {AUTH_LABELS[value]}
              </option>
            ))}
          </select>
        )}
      </div>

      {state.enabled && isAppleEvents && (
        <AppleEventReceiverEditor
          receivers={state.receivers ?? []}
          knownApps={knownApps}
          onChange={setReceivers}
        />
      )}
    </div>
  );
}
