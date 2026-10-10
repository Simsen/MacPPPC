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
import { Switch } from './Card';
import { cn } from '@/lib/cn';

interface Props {
  item: SelectedApp;
  mode: OutputMode;
  target: MacOSTarget;
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
    <div className={cn('rounded-xl border bg-card overflow-hidden transition', item.expanded ? 'border-border-strong shadow-[var(--shadow-soft)]' : 'border-border hover:border-border-strong')}>
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex-1 min-w-0 flex items-center gap-3 px-4 py-3.5 text-left hover:bg-card-elevated/50 transition"
          aria-expanded={item.expanded}
        >
          <div className="text-muted-foreground">
            {item.expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
          <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-primary/20 to-info/20 text-primary ring-1 ring-inset ring-primary/15 flex items-center justify-center flex-shrink-0 text-[15px] font-semibold">
            {item.app.displayName.trim().charAt(0).toUpperCase() || <AppWindow className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold tracking-tight truncate">{item.app.displayName}</span>
              {item.isKnownApp && (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  Known
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground truncate font-mono mt-0.5">
              {item.app.bundleId}
            </div>
          </div>
          <span className={cn('text-[11px] font-mono whitespace-nowrap tabular-nums px-2 py-1 rounded-md border', enabledCount > 0 ? 'border-primary/30 bg-primary/[0.07] text-primary' : 'border-border text-muted-foreground')}>
            {enabledCount} / {visibleIds.length} enabled
          </span>
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center justify-center px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
          aria-label="Remove app"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div
        className={cn(
          'border-t border-border',
          !item.expanded && 'hidden',
        )}
      >
        {mode === 'separate' && (
          <div className="p-5 bg-primary/[0.03] border-b border-border">
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
                  className="w-full text-sm bg-input border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/60 transition"
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
                  className="w-full text-sm bg-input border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/60 transition"
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
                  className="w-full text-sm bg-input border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/60 transition"
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
                    className="flex-1 text-xs font-mono bg-input border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/60 transition"
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
                    className="px-2.5 rounded-lg border border-border hover:bg-card-elevated text-muted-foreground hover:text-foreground transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="p-5 bg-card-elevated/40 border-b border-border">
          <div className="section-label mb-2">Code Requirement</div>
          <textarea
            value={item.app.codeRequirement ?? ''}
            onChange={(e) => onChangeCodeRequirement(e.target.value)}
            rows={3}
            className="w-full text-[11px] leading-relaxed font-mono bg-input border border-border rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/60 transition"
            placeholder={`identifier "${item.app.bundleId}" and anchor apple generic`}
          />
          {!item.app.codeRequirement && (
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Default requirement will be used if left empty.
            </p>
          )}
        </div>
        <div className="p-3 space-y-1">
          {PERMISSION_CATEGORIES.map((cat) => {
            const perms = pppcPerms.filter((p) => p.category === cat.id);
            if (perms.length === 0) return null;
            return (
              <div key={cat.id}>
                <div className="section-label px-3 pt-3 pb-1.5">
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
          <div className="border-t border-border p-3 bg-primary/[0.02]">
            <div className="px-3 pt-3 pb-1 flex items-center gap-2">
              <span className="section-label">
                App Privacy
              </span>
              <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
                DDM · macOS 27
              </span>
            </div>
            <p className="px-3 pb-1 text-xs text-muted-foreground">
              Enabled permissions are suggested as Allow in one consent prompt.
              The user can decline. Deployed as a separate Settings Catalog policy.
              Requires a supervised Mac (ADE) and only works for AppKit apps.
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
                className="w-full text-sm bg-input border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/60 transition"
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
    <div className={cn('px-3 py-3 rounded-lg transition', enabled ? 'bg-primary/[0.04]' : 'hover:bg-card-elevated/60')}>
      <div className="flex items-center gap-2">
        <Switch checked={enabled} onChange={onToggle} label={perm.name} />
        <span className="text-sm font-medium">{perm.name}</span>
        {enabled && (
          <span className="text-[10px] font-mono text-primary px-1.5 py-0.5 rounded-md bg-primary/10">
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
              <span className="absolute left-6 top-0 z-10 w-72 p-3 rounded-lg bg-card border border-border shadow-[var(--shadow-lift)] text-xs text-foreground">
                {perm.tooltip}
              </span>
            )}
          </button>
        )}
      </div>
      <p className="text-[13px] text-muted-foreground mt-1 ml-11">{perm.description}</p>
    </div>
  );
}
