import { Package, Layers } from 'lucide-react';
import type { OutputMode } from '@/lib/types';
import { Choice } from './Card';

interface Props {
  value: OutputMode;
  onChange: (next: OutputMode) => void;
  appCount: number;
}

export function OutputModeToggle({ value, onChange, appCount }: Props) {
  return (
    <div className="px-6 pt-5">
      <div className="section-label mb-2">Output</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Choice
          active={value === 'bundle'}
          onClick={() => onChange('bundle')}
          icon={<Package className="w-4 h-4" />}
          title="Single bundle"
          subtitle={`One .mobileconfig for all ${appCount} app${appCount === 1 ? '' : 's'}`}
        />
        <Choice
          active={value === 'separate'}
          onClick={() => onChange('separate')}
          icon={<Layers className="w-4 h-4" />}
          title="Separate profiles"
          subtitle={`One .mobileconfig per app · ${appCount} polic${appCount === 1 ? 'y' : 'ies'}`}
        />
      </div>
    </div>
  );
}
