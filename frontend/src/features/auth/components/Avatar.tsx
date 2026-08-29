import { useState } from 'react';
import type { UserDTO } from '../types/user';

const initialsSize = 'h-9 w-9 text-[0.9rem]';

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Avatar({ user }: { user: UserDTO }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="flex items-center gap-2.5" title={user.name}>
      {user.avatarUrl && !imageFailed ? (
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="h-9 w-9 rounded-full border border-border object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span
          aria-hidden="true"
          className={`${initialsSize} inline-flex items-center justify-center rounded-full bg-cobalt-mist font-display font-semibold text-cobalt-ink`}
        >
          {initials(user.name)}
        </span>
      )}
      <span className="hidden text-[0.95rem] font-semibold text-ink sm:inline">{user.name}</span>
    </div>
  );
}