# Known apps library

`known-apps.json` is the list behind *Select a known application…*. It is
loaded at runtime from `/library/known-apps.json`, so changes ship without
a rebuild.

Each entry maps a bundle ID to its **designated code requirement**:

```json
{
  "apps": [
    {
      "bundleId": "com.microsoft.teams2",
      "displayName": "Microsoft Teams (new)",
      "codeRequirement": "identifier \"com.microsoft.teams2\" and anchor apple generic and …"
    }
  ]
}
```

## Adding an app

Get the code requirement from an installed copy of the app:

```bash
codesign --display -r - /Applications/YourApp.app
```

Or harvest every app in `/Applications` at once — the script emits one JSON
entry per app in the shape above:

```bash
./scripts/harvest-known-apps.sh                # scans /Applications
./scripts/harvest-known-apps.sh /path/to/Apps  # scan a different folder
```

Merge new entries into the `apps` array by hand and keep the list sorted
by `displayName`. Not comfortable with a pull request? Open an issue with
the **Add a known app** template instead.

## What does NOT belong here

- Requirements copied from an unsigned or re-signed build — they will not
  match the real app.
- Anything tenant-specific (organization names, payload UUIDs).
