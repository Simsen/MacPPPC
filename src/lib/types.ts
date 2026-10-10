export type Authorization = 'Allow' | 'AllowStandardUserToSetSystemService' | 'Deny';

export type DeploymentChannel = 'deviceChannel' | 'userChannel';

/**
 * Authorization model for a PPPC service, mirroring Jamf's PPPCServices.json
 * (`denyOnly` + `allowStandardUsers`) flattened into three mutually-exclusive modes.
 *
 * - `standard`            — full Allow / Deny / AllowStandardUserToSetSystemService (most services).
 * - `denyOrStandardUser`  — Apple forbids force-Allow but standard users can self-grant
 *                           via System Settings (ScreenCapture, ListenEvent).
 * - `denyOnly`            — only Deny has any effect; other values are silently ignored
 *                           by macOS (Camera, Microphone).
 */
export type AuthMode = 'standard' | 'denyOrStandardUser' | 'denyOnly';

/** Grouping for UI rendering — purely visual, has no effect on the generated profile. */
export type PermissionCategory =
  | 'common'
  | 'hardware'
  | 'personalData'
  | 'fileAccess'
  | 'appControl';

export interface PppcPermission {
  id: string;
  name: string;
  description: string;
  tccService: string;
  authMode: AuthMode;
  category: PermissionCategory;
  /** Minimum macOS version required for the service. Informational only. */
  minMacOS?: string;
  /** macOS version in which Apple deprecated this service. Informational only. */
  deprecatedIn?: string;
  tooltip?: string;
  /** macOS 27+: id of the APP_PRIVACY_PERMISSIONS entry that replaces this PPPC service. */
  ddmReplacement?: string;
}

export type MacOSTarget = '26' | '27';

/**
 * A permission in the macOS 27 DDM `com.apple.configuration.app.settings` →
 * `Privacy.PermissionDefaults` dictionary. Enabled = suggest the allow value;
 * DDM has no Deny, so there is nothing else to pick.
 */
export interface AppPrivacyPermission {
  id: string;
  name: string;
  description: string;
  /** Lowercased key Intune uses in the setting definition id. */
  ddmKey: string;
  /** Choice-option suffix for the allow value (`_1` = Allow, Location `_2` = Always). */
  allowSuffix: string;
  tooltip?: string;
}

export interface WebsitePrivacy {
  id: number;
  /** "example.com" or "*example.com" (domain + sub-domains). */
  domain: string;
  camera: boolean;
  microphone: boolean;
  justification: string;
}

export interface KnownApp {
  bundleId: string;
  displayName: string;
  codeRequirement: string;
}

export interface AppInfo {
  bundleId: string;
  displayName: string;
  codeRequirement: string | null;
}

/**
 * One AppleEvents receiver entry: this app may control that target app.
 * Each receiver becomes a separate dict in the AppleEvents service array,
 * with its own Authorization.
 */
export interface AppleEventReceiver {
  identifier: string;
  identifierType: 'bundleID' | 'path';
  codeRequirement: string;
  authorization: Authorization;
}

export interface PermissionState {
  enabled: boolean;
  authorization: Authorization;
  /** AppleEvents-only — receiver list. Ignored for any other service. */
  receivers?: AppleEventReceiver[];
}

export type PermissionsState = Record<string, PermissionState>;

export interface SelectedApp {
  id: number;
  app: AppInfo;
  permissions: PermissionsState;
  expanded: boolean;
  isKnownApp: boolean;
  /** Per-app profile metadata. Used in 'separate' output mode; ignored in 'bundle' mode. */
  profile: {
    name: string;
    description: string;
    identifier: string;
    organization: string;
  };
  /** Intune scope tag IDs to apply on deploy (separate mode). Defaults to ["0"] (Default). */
  scopeTagIds: string[];
  /** Intune deployment channel for this profile. Defaults to 'deviceChannel'. */
  deploymentChannel: DeploymentChannel;
  /** Empty = profile default. */
  privacyJustification: string;
}

export interface ProfileSettings {
  organization: string;
  payloadName: string;
  payloadIdentifier: string;
  payloadDescription: string;
  /** Intune scope tag IDs for the bundled policy. Defaults to ["0"] (Default). */
  scopeTagIds: string[];
  /** Intune deployment channel for the bundled policy. */
  deploymentChannel: DeploymentChannel;
  privacyJustification: string;
}

export type OutputMode = 'bundle' | 'separate';

/**
 * How a generated profile is uploaded to Intune.
 *
 * - 'classic'          — `.mobileconfig` plist deployed as `macOSCustomConfiguration`
 *                        (existing behaviour). Output is XML.
 * - 'settingsCatalog'  — Microsoft Intune Settings Catalog policy deployed via
 *                        `configurationPolicies`. Output is JSON.
 */
export type DeploymentFormat = 'classic' | 'settingsCatalog';

export interface GeneratedProfile {
  filename: string;
  policyName: string;
  description: string;
  /** Serialized policy body. XML for `classic`, JSON for `settingsCatalog`. */
  content: string;
  format: DeploymentFormat;
  /** When mode === 'separate', the bundleId of the single app this profile is for. */
  bundleId?: string;
  /** Intune scope tag IDs to set on the policy when deployed. */
  scopeTagIds: string[];
  /** Intune deployment channel ('deviceChannel' or 'userChannel'). */
  deploymentChannel: DeploymentChannel;
  kind: 'pppc' | 'appPrivacy' | 'safariPrivacy';
  labels: string[];
}
