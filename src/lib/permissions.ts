import type { AppPrivacyPermission, PppcPermission } from './types';

/**
 * The 24 PPPC services Apple exposes via the
 * `com.apple.TCC.configuration-profile-policy` payload, as documented at
 * https://developer.apple.com/documentation/devicemanagement/privacypreferencespolicycontrol/services-data.dictionary
 *
 * Authorization model:
 *   - standard            : Allow / Deny / AllowStandardUserToSetSystemService
 *   - denyOrStandardUser  : Apple disallows force-Allow; standard users may self-grant
 *   - denyOnly            : only Deny has effect; other values are ignored by macOS
 *
 * Note: `DeveloperTool` exists at the TCC layer (visible to `tccutil`) but is
 * intentionally not part of the MDM-exposed PPPC services dictionary — omitted.
 */
export const PPPC_PERMISSIONS: PppcPermission[] = [
  // ─── Common ──────────────────────────────────────────────────────────────
  {
    id: 'accessibility',
    name: 'Accessibility',
    description: 'Control your computer using accessibility features',
    tccService: 'Accessibility',
    authMode: 'standard',
    category: 'common',
    ddmReplacement: 'accessibility',
    deprecatedIn: '27.0',
    tooltip:
      'Apple deprecated this service in macOS 27 in favour of DDM App Privacy, but it is still required for macOS 26 and earlier.',
  },
  {
    id: 'fullDiskAccess',
    name: 'Full Disk Access',
    description: 'Access all files on the system, including system-protected areas',
    tccService: 'SystemPolicyAllFiles',
    authMode: 'standard',
    category: 'common',
    tooltip:
      'Grants access to every protected file. If the app only needs Desktop/Documents/Downloads, prefer the folder-specific services instead to avoid over-provisioning.',
  },
  {
    id: 'automation',
    name: 'Automation (Apple Events)',
    description: 'Control other apps via Apple Events / AppleScript',
    tccService: 'AppleEvents',
    authMode: 'standard',
    category: 'common',
    tooltip:
      'AppleEvents permissions are pairs: this app may control specific *receiver* apps. Add one or more receivers below.',
  },

  // ─── Hardware & Input ────────────────────────────────────────────────────
  {
    id: 'camera',
    name: 'Camera',
    description: 'Access the camera',
    tccService: 'Camera',
    authMode: 'denyOnly',
    category: 'hardware',
    ddmReplacement: 'camera',
    tooltip:
      'Apple does not permit MDM to pre-approve or allow camera access — only Deny has effect. User must grant via System Settings.',
  },
  {
    id: 'microphone',
    name: 'Microphone',
    description: 'Access the microphone',
    tccService: 'Microphone',
    authMode: 'denyOnly',
    category: 'hardware',
    ddmReplacement: 'microphone',
    tooltip:
      'Apple does not permit MDM to pre-approve or allow microphone access — only Deny has effect. User must grant via System Settings.',
  },
  {
    id: 'screenRecording',
    name: 'Screen Recording',
    description: 'Record the contents of the screen',
    tccService: 'ScreenCapture',
    authMode: 'denyOrStandardUser',
    category: 'hardware',
    tooltip:
      'Apple requires user consent for Screen Recording. MDM can deny it or permit standard (non-admin) users to enable it themselves.',
  },
  {
    id: 'inputMonitoring',
    name: 'Input Monitoring',
    description:
      'Listen to CoreGraphics events (CGEvents) and HID input events. Shown as "Input Monitoring" in System Settings.',
    tccService: 'ListenEvent',
    authMode: 'denyOrStandardUser',
    category: 'hardware',
    tooltip:
      'TCC service: ListenEvent. The receive-side counterpart to PostEvent. Used by remote-control / password-manager / automation tools that hook keyboard or mouse globally. Apple disallows force-Allow — deny or permit standard-user self-grant only.',
  },
  {
    id: 'postEvent',
    name: 'Post Event',
    description:
      'Send CoreGraphics events (CGEvents) into the system event stream',
    tccService: 'PostEvent',
    authMode: 'standard',
    category: 'hardware',
    tooltip:
      'TCC service: PostEvent. The send-side counterpart to ListenEvent (Input Monitoring) — used by tools that synthesise CGEvents (assistive software, RPA / scripting tools).',
  },
  {
    id: 'bluetooth',
    name: 'Bluetooth',
    description: 'Use Bluetooth devices',
    tccService: 'BluetoothAlways',
    authMode: 'standard',
    category: 'hardware',
    ddmReplacement: 'bluetooth',
  },

  // ─── Personal Data ───────────────────────────────────────────────────────
  {
    id: 'contacts',
    name: 'Contacts',
    description: 'Access your contacts',
    tccService: 'AddressBook',
    authMode: 'standard',
    category: 'personalData',
  },
  {
    id: 'calendars',
    name: 'Calendars',
    description: 'Access your calendars',
    tccService: 'Calendar',
    authMode: 'standard',
    category: 'personalData',
  },
  {
    id: 'reminders',
    name: 'Reminders',
    description: 'Access your reminders',
    tccService: 'Reminders',
    authMode: 'standard',
    category: 'personalData',
  },
  {
    id: 'photos',
    name: 'Photos',
    description: 'Access your photo library',
    tccService: 'Photos',
    authMode: 'standard',
    category: 'personalData',
  },
  {
    id: 'mediaLibrary',
    name: 'Media Library',
    description: 'Access the Apple Music / iTunes media library',
    tccService: 'MediaLibrary',
    authMode: 'standard',
    category: 'personalData',
    tooltip:
      'Only meaningful for apps that read the user\'s Apple Music / iTunes library via MPMediaLibrary.',
  },
  {
    id: 'speechRecognition',
    name: 'Speech Recognition',
    description: 'Send audio to Apple\'s Speech Recognition service',
    tccService: 'SpeechRecognition',
    authMode: 'standard',
    category: 'personalData',
    ddmReplacement: 'dictation',
    tooltip: 'Only meaningful for apps using SFSpeechRecognizer.',
  },

  // ─── File Access (granular) ──────────────────────────────────────────────
  {
    id: 'desktopFolder',
    name: 'Desktop Folder',
    description: 'Access files in the user\'s Desktop folder',
    tccService: 'SystemPolicyDesktopFolder',
    authMode: 'standard',
    category: 'fileAccess',
  },
  {
    id: 'documentsFolder',
    name: 'Documents Folder',
    description: 'Access files in the user\'s Documents folder',
    tccService: 'SystemPolicyDocumentsFolder',
    authMode: 'standard',
    category: 'fileAccess',
  },
  {
    id: 'downloadsFolder',
    name: 'Downloads Folder',
    description: 'Access files in the user\'s Downloads folder',
    tccService: 'SystemPolicyDownloadsFolder',
    authMode: 'standard',
    category: 'fileAccess',
  },
  {
    id: 'networkVolumes',
    name: 'Network Volumes',
    description: 'Access files on network volumes',
    tccService: 'SystemPolicyNetworkVolumes',
    authMode: 'standard',
    category: 'fileAccess',
  },
  {
    id: 'removableVolumes',
    name: 'Removable Volumes',
    description: 'Access files on removable volumes',
    tccService: 'SystemPolicyRemovableVolumes',
    authMode: 'standard',
    category: 'fileAccess',
  },
  {
    id: 'sysAdminFiles',
    name: 'Administrator Files',
    description: 'Access system administration files (/private/etc, /var/db, …)',
    tccService: 'SystemPolicySysAdminFiles',
    authMode: 'standard',
    category: 'fileAccess',
    tooltip:
      'Narrower than Full Disk Access — grants access to admin-only paths without exposing user data.',
  },
  {
    id: 'fileProviderPresence',
    name: 'File Provider Presence',
    description: 'See when other apps access files managed by this File Provider',
    tccService: 'FileProviderPresence',
    authMode: 'standard',
    category: 'fileAccess',
    tooltip:
      'Only meaningful for File Provider extensions (OneDrive, Dropbox, iCloud-style sync clients).',
  },

  // ─── App Control ─────────────────────────────────────────────────────────
  {
    id: 'appBundles',
    name: 'App Bundles',
    description: 'Update or delete other apps\' bundles',
    tccService: 'SystemPolicyAppBundles',
    authMode: 'standard',
    category: 'appControl',
    minMacOS: '13.0',
    tooltip:
      'macOS 13+. Only meaningful for app-management tools (Munki, Jamf binary, installer/updater agents).',
  },
  {
    id: 'appData',
    name: 'App Data',
    description: 'Access other apps\' container data',
    tccService: 'SystemPolicyAppData',
    authMode: 'standard',
    category: 'appControl',
    tooltip:
      'Only meaningful for backup, anti-virus, migration, or DLP tools that read other apps\' Application Support data.',
  },
];

/** Display labels for each category, in render order. */
export const PERMISSION_CATEGORIES: { id: PppcPermission['category']; label: string }[] = [
  { id: 'common', label: 'Common' },
  { id: 'hardware', label: 'Hardware & Input' },
  { id: 'personalData', label: 'Personal Data' },
  { id: 'fileAccess', label: 'File Access' },
  { id: 'appControl', label: 'App Control' },
];

/**
 * macOS 27 DDM App Privacy permission defaults
 * (`com.apple.configuration.app.settings` → `Privacy.PermissionDefaults`).
 * Suggestions only: the user gets one consent prompt and may decline.
 * LocationAccuracy is iOS-only and intentionally omitted.
 */
export const APP_PRIVACY_PERMISSIONS: AppPrivacyPermission[] = [
  {
    id: 'accessibility',
    name: 'Accessibility',
    description: 'Control your computer using accessibility features',
    ddmKey: 'accessibility',
    allowSuffix: '1',
  },
  {
    id: 'camera',
    name: 'Camera',
    description: 'Access the camera',
    ddmKey: 'camera',
    allowSuffix: '1',
  },
  {
    id: 'microphone',
    name: 'Microphone',
    description: 'Access the microphone',
    ddmKey: 'microphone',
    allowSuffix: '1',
  },
  {
    id: 'bluetooth',
    name: 'Bluetooth',
    description: 'Use Bluetooth devices',
    ddmKey: 'bluetooth',
    allowSuffix: '1',
  },
  {
    id: 'dictation',
    name: 'Dictation',
    description: 'Use dictation / speech recognition',
    ddmKey: 'dictation',
    allowSuffix: '1',
    tooltip: 'Replaces the PPPC SpeechRecognition service on macOS 27. Close, but not guaranteed to be identical.',
  },
  {
    id: 'localNetwork',
    name: 'Local Network',
    description: 'Find and connect to devices on the local network',
    ddmKey: 'localnetwork',
    allowSuffix: '1',
    tooltip: 'New in macOS 27 — there is no PPPC equivalent.',
  },
  {
    id: 'location',
    name: 'Location',
    description: 'Access the Mac\'s location (always)',
    ddmKey: 'location',
    // ponytail: only "Always" — Apple documents WhileUsing as equal to Always on macOS.
    allowSuffix: '2',
    tooltip: 'New in macOS 27 — there is no PPPC equivalent. On macOS "While using" behaves as "Always", so only Always is offered.',
  },
];
