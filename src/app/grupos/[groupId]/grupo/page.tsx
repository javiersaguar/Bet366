import { loadGroup, loadGroupSummary } from '@/lib/data';
import { GroupSummaryScreen } from '@/screens/group-summary';
import { LeaveGroupForm } from './leave-form';

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
  const soyElJefe = summary.members.find((m) => m.profile.id === me.id)?.role === 'owner';

  return (
    <GroupSummaryScreen
      basePath={`/grupos/${groupId}`}
      group={group}
      season={season}
      me={me}
      summary={summary}
      leaveForm={
        soyElJefe ? null : <LeaveGroupForm groupId={groupId} groupName={group.name} />
      }
    />
  );
}
