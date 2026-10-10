import { useState } from 'react';
import { FileCode2, FileJson, Info } from 'lucide-react';
import type { DeploymentFormat } from '@/lib/types';
import { Choice } from './Card';

interface Props {
  value: DeploymentFormat;
  onChange: (next: DeploymentFormat) => void;
}

export function FormatToggle({ value, onChange }: Props) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="px-6 pt-4 pb-5 border-b border-border">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="section-label">Deployment format</div>
        <button
          type="button"
          onMouseEnter={() => setShowHelp(true)}
          onMouseLeave={() => setShowHelp(false)}
          onFocus={() => setShowHelp(true)}
          onBlur={() => setShowHelp(false)}
          className="text-muted-foreground hover:text-foreground relative"
          aria-label="What's the difference?"
        >
          <Info className="w-3.5 h-3.5" />
          {showHelp && (
            <div className="absolute left-0 top-5 z-20 w-[340px] p-3.5 rounded-lg bg-card border border-border shadow-[var(--shadow-lift)] text-[11px] text-foreground text-left space-y-2">
              <p>
                Both formats deploy the <strong>same 24 PPPC services</strong>{' '}
                with identical capabilities — the choice affects how the policy
                appears in Intune.
              </p>
              <div>
                <div className="font-semibold mt-1.5">Templates › Custom</div>
                <p className="text-muted-foreground">
                  Uploaded as a raw <code>.mobileconfig</code> plist
                  (<code>macOSCustomConfiguration</code>). Legacy format; editing
                  requires re-uploading the file.
                </p>
              </div>
              <div>
                <div className="font-semibold">Settings Catalog</div>
                <p className="text-muted-foreground">
                  Microsoft's modern format
                  (<code>configurationPolicies</code>). Editable per-setting in
                  the Intune portal after deployment; settings are reusable
                  across policies.
                </p>
              </div>
            </div>
          )}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Choice
          active={value === 'classic'}
          onClick={() => onChange('classic')}
          icon={<FileCode2 className="w-4 h-4" />}
          title="Templates › Custom"
          subtitle=".mobileconfig · macOSCustomConfiguration"
        />
        <Choice
          active={value === 'settingsCatalog'}
          onClick={() => onChange('settingsCatalog')}
          icon={<FileJson className="w-4 h-4" />}
          title="Settings Catalog"
          subtitle="JSON · configurationPolicies"
        />
      </div>
    </div>
  );
}

