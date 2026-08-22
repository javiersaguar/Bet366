import { NotificationsScreen } from '@/screens/notifications';
import { grupoActual } from '@/app/demo/estado';

export default async function DemoNotifications() {
  const { group, notifications } = await grupoActual();
  return <NotificationsScreen basePath="/demo" groupId={group.id} items={notifications} />;
}
