import { APP_PRIVACY_PERMISSIONS } from './permissions';
import {
  choice,
  defaultCodeRequirement,
  groupColl,
  simple,
  valueWrapper,
  wrapPolicy,
  type SettingInstance,
  type SettingsCatalogPolicy,
} from './settingsCatalog';
import type { ProfileSettings, SelectedApp, WebsitePrivacy } from './types';

/**
 * macOS 27 DDM privacy declarations as Intune Settings Catalog policies:
 *   - `com.apple.configuration.app.settings`    → Privacy.PermissionDefaults (per app)
 *   - `com.apple.configuration.safari.settings` → Privacy.PermissionDefaults (per website)
 *
 * Both share one tree (verified with a live Intune round-trip):
 *
 *   {p}_{p}                                       root group
 *    └ {p}_privacy
 *       └ {p}_privacy_permissiondefaults          one value per app / website
 *          ├ …_generickey_keytobereplaced         the dictionary key (string)
 *          └ …_generickey                         the dictionary value
 *             ├ …_organizationjustification       required
 *             └ …_camera / _microphone / …        choice, `_1` = Allow
 */

interface Entry {
  key: string;
  justification: string;
  choices: { ddmKey: string; suffix: string }[];
}

function buildDeclaration(prefix: 'app' | 'safari', entries: Entry[]): SettingInstance {
  const defaults = `${prefix}_privacy_permissiondefaults`;
  const generic = `${defaults}_generickey`;
  return groupColl(`${prefix}_${prefix}`, [
    valueWrapper([
      groupColl(`${prefix}_privacy`, [
        valueWrapper([
          groupColl(
            defaults,
            entries.map((e) =>
              valueWrapper([
                simple(`${generic}_keytobereplaced`, e.key),
                groupColl(generic, [
                  valueWrapper([
                    simple(`${generic}_organizationjustification`, e.justification),
                    ...e.choices.map((c) => choice(`${generic}_${c.ddmKey}`, c.suffix)),
                  ]),
                ]),
              ]),
            ),
          ),
        ]),
      ]),
    ]),
  ]);
}

function orgName(settings: ProfileSettings): string {
  return settings.organization.trim() || 'Your organization';
}

export function defaultAppJustification(settings: ProfileSettings, appName: string): string {
  return (
    settings.privacyJustification.trim() ||
    `${orgName(settings)} requires these permissions for ${appName}.`
  );
}

export function defaultWebsiteJustification(
  settings: ProfileSettings,
  site: Pick<WebsitePrivacy, 'camera' | 'microphone'>,
): string {
  const what = [site.camera && 'camera', site.microphone && 'microphone']
    .filter(Boolean)
    .join(' and ');
  return (
    settings.privacyJustification.trim() ||
    `${orgName(settings)} requires ${what || 'camera and microphone'} access for this website.`
  );
}

export function appPrivacyApps(apps: SelectedApp[]): SelectedApp[] {
  return apps.filter((a) => APP_PRIVACY_PERMISSIONS.some((p) => a.permissions[p.id]?.enabled));
}

export function activeWebsites(sites: WebsitePrivacy[]): WebsitePrivacy[] {
  return sites.filter((s) => s.domain.trim() !== '' && (s.camera || s.microphone));
}

export function buildAppPrivacyPolicy(
  apps: SelectedApp[],
  settings: ProfileSettings,
): SettingsCatalogPolicy | null {
  const entries: Entry[] = appPrivacyApps(apps).map((item) => {
    const req = item.app.codeRequirement || defaultCodeRequirement(item.app.bundleId);
    return {
      // macOS composed identifier: "Bundle-ID {Designated-Requirement}"
      key: `${item.app.bundleId} {${req}}`,
      justification:
        item.privacyJustification.trim() ||
        defaultAppJustification(settings, item.app.displayName),
      choices: APP_PRIVACY_PERMISSIONS.filter((p) => item.permissions[p.id]?.enabled).map(
        (p) => ({ ddmKey: p.ddmKey, suffix: p.allowSuffix }),
      ),
    };
  });
  if (entries.length === 0) return null;
  return wrapPolicy(settings, buildDeclaration('app', entries), 'App Privacy');
}

export function buildSafariPrivacyPolicy(
  sites: WebsitePrivacy[],
  settings: ProfileSettings,
): SettingsCatalogPolicy | null {
  const entries: Entry[] = activeWebsites(sites).map((s) => ({
    key: s.domain.trim(),
    justification: s.justification.trim() || defaultWebsiteJustification(settings, s),
    choices: [
      ...(s.camera ? [{ ddmKey: 'camera', suffix: '1' }] : []),
      ...(s.microphone ? [{ ddmKey: 'microphone', suffix: '1' }] : []),
    ],
  }));
  if (entries.length === 0) return null;
  return wrapPolicy(settings, buildDeclaration('safari', entries), 'Safari Privacy');
}
