import { APP_PRIVACY_PERMISSIONS, PPPC_PERMISSIONS } from './permissions';
import type { MacOSTarget, PermissionsState, SelectedApp } from './types';

export interface ConversionReport {
  to: MacOSTarget;
  /** "Teams: Accessibility → App Privacy" */
  moved: string[];
  /** "Teams: Camera (Deny) — App Privacy has no Deny" */
  dropped: string[];
}

/**
 * Rewrite each app's permission state when the user flips the macOS target.
 *
 * 26 → 27: the five PPPC services with a `ddmReplacement` move to App Privacy.
 *          Allow / AllowStandardUser become a suggested Allow; Deny cannot be
 *          expressed in DDM and is dropped.
 * 27 → 26: App Privacy entries move back to PPPC Allow where PPPC allows it.
 *          Camera / Microphone (PPPC is deny-only) and Local Network / Location
 *          (no PPPC service) are dropped.
 *
 * Everything dropped is reported by name so nothing disappears silently.
 */
export function convertApps(
  apps: SelectedApp[],
  to: MacOSTarget,
): { apps: SelectedApp[]; report: ConversionReport } {
  const report: ConversionReport = { to, moved: [], dropped: [] };

  const converted = apps.map((item) => {
    const perms: PermissionsState = { ...item.permissions };
    const name = item.app.displayName;

    if (to === '27') {
      for (const pppc of PPPC_PERMISSIONS) {
        const state = perms[pppc.id];
        if (!pppc.ddmReplacement || !state?.enabled) continue;
        perms[pppc.id] = { ...state, enabled: false };
        const ddm = APP_PRIVACY_PERMISSIONS.find((d) => d.id === pppc.ddmReplacement)!;
        if (state.authorization === 'Deny') {
          report.dropped.push(`${name}: ${pppc.name} (Deny) — App Privacy has no Deny`);
          continue;
        }
        perms[ddm.id] = { enabled: true, authorization: 'Allow' };
        report.moved.push(
          `${name}: ${pppc.name}${ddm.name !== pppc.name ? ` → ${ddm.name}` : ''}`,
        );
      }
    } else {
      for (const ddm of APP_PRIVACY_PERMISSIONS) {
        const state = perms[ddm.id];
        if (!state?.enabled) continue;
        const pppc = PPPC_PERMISSIONS.find((p) => p.ddmReplacement === ddm.id);
        if (!pppc) {
          perms[ddm.id] = { ...state, enabled: false };
          report.dropped.push(`${name}: ${ddm.name} — no PPPC equivalent`);
        } else if (pppc.authMode !== 'standard') {
          // Camera / Microphone: PPPC can only deny, so an Allow cannot survive.
          perms[ddm.id] = { enabled: false, authorization: 'Deny' };
          report.dropped.push(`${name}: ${ddm.name} — PPPC can only deny it`);
        } else {
          perms[ddm.id] = { ...state, enabled: false };
          perms[pppc.id] = { ...perms[pppc.id], enabled: true, authorization: 'Allow' };
          report.moved.push(
            `${name}: ${ddm.name}${ddm.name !== pppc.name ? ` → ${pppc.name}` : ''}`,
          );
        }
      }
    }

    return { ...item, permissions: perms };
  });

  return { apps: converted, report };
}

/** PPPC services that are still PPPC on this target (27 hides the replaced ones). */
export function pppcPermissionsFor(target: MacOSTarget) {
  return target === '27'
    ? PPPC_PERMISSIONS.filter((p) => !p.ddmReplacement)
    : PPPC_PERMISSIONS;
}
