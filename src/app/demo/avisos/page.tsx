import { NotificationsScreen } from '@/screens/notifications';
import { DEMO_GROUP_ID, NOTIFICATIONS } from '@/lib/fixtures';

export default function DemoNotifications() {
  return <NotificationsScreen basePath="/demo" groupId={DEMO_GROUP_ID} items={NOTIFICATIONS} />;
}
