import { Globe, Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from './Card';
import type { WebsitePrivacy } from '@/lib/types';

interface Props {
  sites: WebsitePrivacy[];
  defaultJustification: string;
  onAdd: () => void;
  onChange: (id: number, next: WebsitePrivacy) => void;
  onRemove: (id: number) => void;
}

const inputCls =
  'w-full text-sm bg-input/60 border border-border/60 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-ring/60';

/** macOS 27 Safari website privacy defaults (camera / microphone per website). */
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
        subtitle="macOS 27 · Suggest camera / microphone access for websites in Safari"
        actions={
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border border-border/60 hover:bg-card-elevated transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add website
          </button>
        }
      />
      <CardBody className="space-y-3">
        {sites.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Optional. Add websites such as <code>teams.microsoft.com</code> or{' '}
            <code>*zoom.us</code> (the <code>*</code> prefix also matches
            sub-domains). Safari shows the user one consent prompt per website.
          </p>
        )}
        {sites.map((s) => (
          <div
            key={s.id}
            className="rounded-md border border-border/60 bg-card-elevated/30 p-3 space-y-2"
          >
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={s.domain}
                onChange={(e) => onChange(s.id, { ...s, domain: e.target.value })}
                placeholder="*example.com"
                aria-label="Website"
                className={`${inputCls} font-mono flex-1`}
              />
              <label className="inline-flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={s.camera}
                  onChange={(e) => onChange(s.id, { ...s, camera: e.target.checked })}
                />
                Camera
              </label>
              <label className="inline-flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={s.microphone}
                  onChange={(e) => onChange(s.id, { ...s, microphone: e.target.checked })}
                />
                Microphone
              </label>
              <button
                type="button"
                onClick={() => onRemove(s.id)}
                className="p-1.5 text-muted-foreground hover:text-destructive transition"
                aria-label="Remove website"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={s.justification}
              onChange={(e) => onChange(s.id, { ...s, justification: e.target.value })}
              placeholder={defaultJustification}
              aria-label="Justification shown to the user"
              className={inputCls}
            />
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
