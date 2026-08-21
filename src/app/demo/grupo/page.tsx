import { GROUP, GROUP_SUMMARY, ME, SEASON } from '@/lib/fixtures';
import { GroupSummaryScreen } from '@/screens/group-summary';

export const metadata = { title: 'El grupo' };

export default function DemoGroupInfoPage() {
  return (
    <GroupSummaryScreen
      basePath="/demo"
      group={GROUP}
      season={SEASON}
      me={ME}
      summary={GROUP_SUMMARY}
    />
  );
}
