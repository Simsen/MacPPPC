import { Laptop, User } from 'lucide-react';
import type { DeploymentChannel } from '@/lib/types';
import { Choice } from './Card';

interface Props {
  value: DeploymentChannel;
  onChange: (next: DeploymentChannel) => void;
}

/**
 * Choose how the policy is delivered: device-channel (system-wide, no user
 * sign-in needed) or user-channel (applies to the signed-in user only).
 * For PPPC the practical default is deviceChannel; userChannel exists for
 * per-user privacy preference profiles.
 */
export function ChannelPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <Choice
        compact
        active={value === 'deviceChannel'}
        onClick={() => onChange('deviceChannel')}
        icon={<Laptop className="w-4 h-4" />}
        title="Device channel"
        subtitle="System-wide, no user required"
      />
      <Choice
        compact
        active={value === 'userChannel'}
        onClick={() => onChange('userChannel')}
        icon={<User className="w-4 h-4" />}
        title="User channel"
        subtitle="Per signed-in user"
      />
    </div>
  );
}

