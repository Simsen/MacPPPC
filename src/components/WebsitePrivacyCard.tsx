import { Globe, Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from './Card';
import type { WebsitePrivacy } from '@/lib/types';
import { websiteDomainError } from '@/lib/ddmPrivacy';
import { cn } from '@/lib/cn';

interface Props {
  sites: WebsitePrivacy[];
  defaultJustification: (site: WebsitePrivacy) => string;
  onAdd: () => void;
  onChange: (id: number, next: WebsitePrivacy) => void;
  onRemove: (id: number) => void;
}

const inputCls =
  'w-full text-sm bg-input border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/60';

export function WebsitePrivacyCard({
  sites,
  defaultJustification,
  onAdd,
  onChange,
  onRemove,
}: Props) {
  return (
    <Card>
      <CardHeader
        icon={<Globe className="w-4 h-4" />}
        title="Safari website privacy"
        subtitle="macOS 27 · supervised Macs · Suggest camera / microphone access for websites in Safari"
        actions={
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card text-primary hover:border-primary/40 hover:bg-primary/[0.05] transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add website
          </button>
        }
      />
      <CardBody className="space-y-3">
        {sites.length === 0 && (
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Optional. Add websites such as <code>teams.microsoft.com</code> or{' '}
            <code>*zoom.us</code> (the <code>*</code> prefix also matches
            sub-domains). Safari shows the user one consent prompt per website.
          </p>
        )}
        {sites.map((s) => {
          const domainError = websiteDomainError(s, sites);
          return (
          <div
            key={s.id}
            className="rounded-lg border border-border bg-card-elevated/40 p-3.5 space-y-2.5"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <input
                type="text"
                value={s.domain}
                onChange={(e) => onChange(s.id, { ...s, domain: e.target.value })}
                placeholder="*example.com"
                aria-label="Website"
                aria-invalid={!!domainError}
                className={cn(
                  inputCls,
                  'font-mono basis-full sm:basis-0 sm:flex-1 min-w-0',
                  domainError && 'border-destructive/60',
                )}
              />
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  checked={s.camera}
                  onChange={(e) => onChange(s.id, { ...s, camera: e.target.checked })}
                />
                Camera
              </label>
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  checked={s.microphone}
                  onChange={(e) => onChange(s.id, { ...s, microphone: e.target.checked })}
                />
                Microphone
              </label>
              <button
                type="button"
                onClick={() => onRemove(s.id)}
                className="ml-auto p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                aria-label="Remove website"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {domainError && <p className="text-xs text-destructive">{domainError}</p>}
            <input
              type="text"
              value={s.justification}
              onChange={(e) => onChange(s.id, { ...s, justification: e.target.value })}
              placeholder={defaultJustification(s)}
              aria-label="Justification shown to the user"
              className={inputCls}
            />
          </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
