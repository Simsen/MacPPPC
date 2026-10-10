import { generateMobileconfig } from './mobileconfig';
import {
  buildSettingsCatalogPolicy,
  serializeSettingsCatalogPolicy,
} from './settingsCatalog';
import {
  activeWebsites,
  appPrivacyApps,
  buildAppPrivacyPolicy,
  buildSafariPrivacyPolicy,
} from './ddmPrivacy';
import { pppcPermissionsFor } from './osTarget';
import { APP_PRIVACY_PERMISSIONS } from './permissions';
import { generateRandomUUID } from './uuid';
import { safeFilename, totalEnabledPermissions } from './state';
import type {
  DeploymentFormat,
  GeneratedProfile,
  MacOSTarget,
  OutputMode,
  ProfileSettings,
  SelectedApp,
  WebsitePrivacy,
} from './types';

/**
 * Returns null when no services would be emitted — e.g. all permissions disabled,
 * or only AppleEvents enabled with zero receivers. Caller is expected to skip
 * the profile in that case rather than emit empty content (which would crash
 * the JSON.parse path in deploy.ts and produce a misleading empty .mobileconfig).
 */
function buildContent(
  apps: SelectedApp[],
  settings: ProfileSettings,
  format: DeploymentFormat,
  innerUUID?: string,
): { content: string; ext: 'mobileconfig' | 'json' } | null {
  if (format === 'classic') {
    const content = generateMobileconfig(apps, settings, innerUUID);
    return content ? { content, ext: 'mobileconfig' } : null;
  }
  const policy = buildSettingsCatalogPolicy(apps, settings);
  return policy
    ? { content: serializeSettingsCatalogPolicy(policy), ext: 'json' }
    : null;
}

function pppcOnly(apps: SelectedApp[], target: MacOSTarget): SelectedApp[] {
  const ids = new Set(pppcPermissionsFor(target).map((p) => p.id));
  return apps.map((a) => ({
    ...a,
    permissions: Object.fromEntries(
      Object.entries(a.permissions).filter(([id]) => ids.has(id)),
    ),
  }));
}

function pppcLabels(apps: SelectedApp[], target: MacOSTarget, withAppName: boolean): string[] {
  const perms = pppcPermissionsFor(target);
  return apps.flatMap((a) =>
    perms
      .filter((p) => a.permissions[p.id]?.enabled)
      .map((p) => (withAppName ? `${a.app.displayName} · ${p.name}` : p.name)),
  );
}

/**
 * macOS 27 adds up to two DDM Settings Catalog policies (App Privacy, Safari
 * Privacy) next to the PPPC profiles for the services that are still PPPC.
 */
export function generateProfiles(
  apps: SelectedApp[],
  shared: ProfileSettings,
  mode: OutputMode,
  format: DeploymentFormat,
  innerUUID: string | undefined,
  target: MacOSTarget,
  websites: WebsitePrivacy[],
): GeneratedProfile[] {
  const out = generatePppcProfiles(pppcOnly(apps, target), shared, mode, format, target, innerUUID);
  if (target === '26') return out;

  const base = shared.payloadName || 'macOS 27';
  const privacyLabels = (list: SelectedApp[], withAppName: boolean) =>
    list.flatMap((a) =>
      APP_PRIVACY_PERMISSIONS.filter((p) => a.permissions[p.id]?.enabled).map((p) =>
        withAppName ? `${a.app.displayName} · ${p.name}` : p.name,
      ),
    );
  // Separate mode: one App Privacy policy per app, named and tagged like its PPPC profile,
  // so a per-app assignment only delivers that app's defaults.
  const appPolicies =
    mode === 'separate'
      ? appPrivacyApps(apps).map((a) => ({
          settings: {
            ...shared,
            organization: a.profile.organization || shared.organization,
            payloadName: `${a.profile.name || `PPPC - ${a.app.displayName}`} - App Privacy`,
            payloadDescription: a.profile.description || shared.payloadDescription,
            scopeTagIds: a.scopeTagIds,
            deploymentChannel: a.deploymentChannel,
          },
          apps: [a],
          labels: privacyLabels([a], false),
        }))
      : [
          {
            settings: { ...shared, payloadName: `${base} - App Privacy` },
            apps,
            labels: privacyLabels(apps, true),
          },
        ];
  const ddm = [
    ...appPolicies.map((p) => ({
      kind: 'appPrivacy' as const,
      settings: p.settings,
      policy: buildAppPrivacyPolicy(p.apps, p.settings),
      labels: p.labels,
    })),
    {
      kind: 'safariPrivacy' as const,
      settings: { ...shared, payloadName: `${base} - Safari Privacy` },
      policy: buildSafariPrivacyPolicy(websites, { ...shared, payloadName: `${base} - Safari Privacy` }),
      labels: activeWebsites(websites).map(
        (s) =>
          `${s.domain} · ${[s.camera && 'Camera', s.microphone && 'Microphone']
            .filter(Boolean)
            .join(' + ')}`,
      ),
    },
  ];
  for (const d of ddm) {
    if (!d.policy) continue;
    out.push({
      filename: `${safeFilename(d.settings.payloadName)}.json`,
      policyName: d.settings.payloadName,
      description: d.settings.payloadDescription,
      content: serializeSettingsCatalogPolicy(d.policy),
      format: 'settingsCatalog',
      scopeTagIds: d.settings.scopeTagIds.length > 0 ? d.settings.scopeTagIds : ['0'],
      deploymentChannel: d.settings.deploymentChannel,
      kind: d.kind,
      labels: d.labels,
    });
  }
  return out;
}

/**
 * Generate one or more PPPC profiles depending on output mode and format.
 *
 * Output mode controls how many profiles are produced:
 *   - 'bundle'   : single profile containing all enabled apps
 *   - 'separate' : one profile per app, using each app's per-app metadata
 *
 * Deployment format controls the serialization shape:
 *   - 'classic'         : `.mobileconfig` plist for macOSCustomConfiguration
 *   - 'settingsCatalog' : JSON for the configurationPolicies Settings Catalog API
 */
function generatePppcProfiles(
  apps: SelectedApp[],
  shared: ProfileSettings,
  mode: OutputMode,
  format: DeploymentFormat,
  target: MacOSTarget,
  innerUUID?: string,
): GeneratedProfile[] {
  if (totalEnabledPermissions(apps) === 0) return [];

  if (mode === 'bundle') {
    const built = buildContent(apps, shared, format, innerUUID);
    if (!built) return [];
    const appSegment = apps
      .map((a) => a.app.bundleId.split('.').pop())
      .filter(Boolean)
      .join('-');
    const baseName = shared.payloadName || `PPPC-${appSegment || 'profile'}`;
    return [
      {
        filename: `${safeFilename(baseName)}.${built.ext}`,
        policyName: shared.payloadName || `PPPC Configuration`,
        description: shared.payloadDescription,
        content: built.content,
        format,
        scopeTagIds: shared.scopeTagIds.length > 0 ? shared.scopeTagIds : ['0'],
        deploymentChannel: shared.deploymentChannel,
        kind: 'pppc',
        labels: pppcLabels(apps, target, true),
      },
    ];
  }

  // Separate: one profile per app that has at least one enabled permission
  // AND would actually emit at least one service entry (AppleEvents with no
  // receivers, for instance, is "enabled" but emits nothing).
  const out: GeneratedProfile[] = [];
  for (const app of apps) {
    if (totalEnabledPermissions([app]) === 0) continue;
    const perAppSettings: ProfileSettings = {
      organization: app.profile.organization || shared.organization,
      payloadName: app.profile.name || `PPPC - ${app.app.displayName}`,
      payloadIdentifier: app.profile.identifier,
      payloadDescription: app.profile.description || shared.payloadDescription,
      scopeTagIds: app.scopeTagIds,
      deploymentChannel: app.deploymentChannel,
      privacyJustification: shared.privacyJustification,
    };
    const built = buildContent(
      [app],
      perAppSettings,
      format,
      generateRandomUUID(),
    );
    if (!built) continue;
    out.push({
      filename: `${safeFilename(perAppSettings.payloadName)}.${built.ext}`,
      policyName: perAppSettings.payloadName,
      description: perAppSettings.payloadDescription,
      content: built.content,
      format,
      bundleId: app.app.bundleId,
      scopeTagIds: app.scopeTagIds.length > 0 ? app.scopeTagIds : ['0'],
      deploymentChannel: app.deploymentChannel,
      kind: 'pppc',
      labels: pppcLabels([app], target, false),
    });
  }
  return out;
}
