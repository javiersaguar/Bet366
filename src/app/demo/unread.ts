import { NOTIFICATIONS } from '@/lib/fixtures';

export function countUnreadDemo(): number {
  return NOTIFICATIONS.filter((n) => n.read_at === null).length;
}
