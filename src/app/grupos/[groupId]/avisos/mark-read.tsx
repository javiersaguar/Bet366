'use client';

import { useTransition } from 'react';
import { markNotificationsReadAction } from '@/lib/actions';
import { useToast } from '@/components/toast';

export function MarkAllRead({ groupId }: { groupId: string }) {
  const [pending, start] = useTransition();
  const toast = useToast();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const result = await markNotificationsReadAction(groupId);
          if (result.error) toast(result.error, 'error');
        })
      }
      className="btn-ghost !py-2 text-2xs"
    >
      {pending ? 'Marcando…' : 'Marcar todo leído'}
    </button>
  );
}
