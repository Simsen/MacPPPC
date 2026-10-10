import { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, ShieldCheck, AppWindow, RefreshCw, Info } from 'lucide-react';
import { APP_PRIVACY_PERMISSIONS, PERMISSION_CATEGORIES } from '@/lib/permissions';
import { pppcPermissionsFor } from '@/lib/osTarget';
import { generateRandomUUID } from '@/lib/uuid';
import type {
  AppPrivacyPermission,
  KnownApp,
  MacOSTarget,
  OutputMode,
  PermissionState,
  SelectedApp,
} from '@/lib/types';
import { PermissionRow } from './PermissionRow';
import { cn } from '@/lib/cn';

interface Props {
  item: SelectedApp;
  mode: OutputMode;
  target: MacOSTarget;
  /** Placeholder for the App Privacy justification (the text used when left empty). */
  justificationPlaceholder: string;
  /** Forwarded to PermissionRow → AppleEventReceiverEditor for the picker. */
  knownApps: KnownApp[];
  onToggleExpanded: () => void;
  onRemove: () => void;
  onChangePermission: (permId: string, next: PermissionState) => void;
  onChangeCodeRequirement: (next: string) => void;
  onChangeProfile: (next: SelectedApp['profile']) => void;
  onChangeJustification: (next: string) => void;
}

export function AppCard({
  item,
  mode,
  target,
  justificationPlaceholder,
  knownApps,
  onToggleExpanded,
  onRemove,
  onChangePermission,
  onChangeCodeRequirement,
  onChangeProfile,
  onChangeJustification,
}: Props) {
  const pppcPerms = pppcPermissionsFor(target);
  const visibleIds = [
    ...pppcPerms.map((p) => p.id),
    ...(target === '27' ? APP_PRIVACY_PERMISSIONS.map((p) => p.id) : []),
  ];
  const enabledCount = visibleIds.filter((id) => item.permissions[id]?.enabled).length;

  return (
    <div className="rounded-lg border border-border/60 bg-card-elevated/30 overflow-hidden transition hover:border-border-strong/50">
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex-1 min-w-0 flex items-center gap-3 p-4 text-left hover:bg-card-elevated/60 transition"
          aria-expanded={item.expanded}
        >
          <div className="text-muted-foreground">
            {item.expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <AppWindow className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{item.app.displayName}</span>
              {item.isKnownApp && (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  Known
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground truncate font-mono">
              {item.app.bundleId}
            </div>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
            {enabledCount} / {visibleIds.length}
          </span>
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center justify-center px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
          aria-label="Remove app"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div
        className={cn(
          'border-t border-border/60 transition-all',
          !item.expanded && 'hidden',
        )}
      >
        {mode === 'separate' && (
          <div className="p-4 bg-primary/[0.03] border-b border-border/60">
            <div className="section-label mb-2">Profile metadata (this app)</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Policy / payload name
                </label>
                <input
                  type="text"
                  value={item.profile.name}
                  onChange={(e) =>
                    onChangeProfile({ ...item.profile, name: e.target.value })
                  }
                  placeholder={`PPPC - ${item.app.displayName}`}
                  className="w-full text-sm bg-input/60 border border-border/60 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-ring/60"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  value={item.profile.organization}
                  onChange={(e) =>
                    onChangeProfile({
                      ...item.profile,
                      organization: e.target.value,
                    })
                  }
                  placeholder="IT Department"
                  className="w-full text-sm bg-input/60 border border-border/60 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-ring/60"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={item.profile.description}
                  onChange={(e) =>
                    onChangeProfile({
                      ...item.profile,
                      description: e.target.value,
                    })
                  }
                  placeholder="Optional"
                  className="w-full text-sm bg-input/60 border border-border/60 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-ring/60"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  PayloadIdentifier (UUID)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.profile.identifier}
                    onChange={(e) =>
                      onChangeProfile({
                        ...item.profile,
                        identifier: e.target.value,
                      })
                    }
                    className="flex-1 text-xs font-mono bg-input/60 border border-border/60 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-ring/60"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChangeProfile({
                        ...item.profile,
                        identifier: generateRandomUUID(),
                      })
                    }
                    title="Generate new UUID"
                    className="px-2 rounded-md border border-border/60 hover:bg-card-elevated text-muted-foreground hover:text-foreground transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="p-4 bg-background/30 border-b border-border/60">
          <div className="section-label mb-2">Code Requirement</div>
          <textarea
            value={item.app.codeRequirement ?? ''}
            onChange={(e) => onChangeCodeRequirement(e.target.value)}
            rows={3}
            className="w-full text-[11px] font-mono bg-input/60 border border-border/60 rounded-md px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-ring/60 transition"
            placeholder={`identifier "${item.app.bundleId}" and anchor apple generic`}
          />
          {!item.app.codeRequirement && (
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Default requirement will be used if left empty.
            </p>
          )}
        </div>
        <div className="p-2 space-y-1">
          {PERMISSION_CATEGORIES.map((cat) => {
            const perms = pppcPerms.filter((p) => p.category === cat.id);
            if (perms.length === 0) return null;
            return (
              <div key={cat.id}>
                <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  {cat.label}
                </div>
                {perms.map((perm) => (
                  <PermissionRow
                    key={perm.id}
                    perm={perm}
                    state={
                      item.permissions[perm.id] ?? {
                        enabled: false,
                        authorization: 'Allow',
                      }
                    }
                    knownApps={knownApps}
                    onChange={(next) => onChangePermission(perm.id, next)}
                  />
                ))}
              </div>
            );
          })}
        </div>
        {target === '27' && (
          <div className="border-t border-border/60 p-2">
            <div className="px-3 pt-3 pb-1 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                App Privacy
              </span>
              <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                DDM · macOS 27
              </span>
            </div>
            <p className="px-3 text-[11px] text-muted-foreground">
              Enabled permissions are suggested as Allow in one consent prompt.
              The user can decline. Deployed as a separate Settings Catalog policy.
            </p>
            {APP_PRIVACY_PERMISSIONS.map((perm) => (
              <AppPrivacyRow
                key={perm.id}
                perm={perm}
                enabled={!!item.permissions[perm.id]?.enabled}
                onToggle={() =>
                  onChangePermission(perm.id, {
                    enabled: !item.permissions[perm.id]?.enabled,
                    authorization: 'Allow',
                  })
                }
              />
            ))}
            <div className="px-3 pt-2 pb-3">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Justification shown to the user
              </label>
              <input
                type="text"
                value={item.privacyJustification}
                onChange={(e) => onChangeJustification(e.target.value)}
                placeholder={justificationPlaceholder}
                className="w-full text-sm bg-input/60 border border-border/60 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-ring/60"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AppPrivacyRow({
  perm,
  enabled,
  onToggle,
}: {
  perm: AppPrivacyPermission;
  enabled: boolean;
  onToggle: () => void;
}) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div className="p-3 rounded-md hover:bg-background/30 transition">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          role="switch"
          aria-checked={enabled}
          className={cn(
            'relative inline-flex h-5 w-9 items-center rounded-full transition',
            enabled ? 'bg-primary' : 'bg-muted',
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition',
              enabled ? 'translate-x-4' : 'translate-x-0.5',
            )}
          />
        </button>
        <span className="font-medium">{perm.name}</span>
        {enabled && (
          <span className="text-[10px] font-mono text-muted-foreground/70 px-1 py-0.5 rounded bg-muted/30">
            {perm.id === 'location' ? 'Always' : 'Allow'}
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
      <p className="text-sm text-muted-foreground mt-1 ml-12">{perm.description}</p>
    </div>
  );
}
