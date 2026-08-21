import { loadGroup, loadNotifications } from '@/lib/data';
import { NotificationsScreen } from '@/screens/notifications';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  await loadGroup(groupId);
  const items = await loadNotifications(groupId);

  return <NotificationsScreen basePath={`/grupos/${groupId}`} groupId={groupId} items={items} />;
}
