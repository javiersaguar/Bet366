import { loadGroup, loadGroupSummary } from '@/lib/data';
import { GroupSummaryScreen } from '@/screens/group-summary';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'El grupo' };

export default async function GroupInfoPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const { group, season, me, members } = await loadGroup(groupId);
  const summary = await loadGroupSummary(groupId, season.number, members);

  return (
    <GroupSummaryScreen
      basePath={`/grupos/${groupId}`}
      group={group}
      season={season}
      me={me}
      summary={summary}
    />
  );
}
