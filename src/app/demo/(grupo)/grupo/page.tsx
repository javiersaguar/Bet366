import { GroupSummaryScreen } from '@/screens/group-summary';
import { grupoActual } from '@/app/demo/estado';

export const metadata = { title: 'El grupo' };

export default async function DemoGroupInfoPage() {
  const { group, season, me, summary } = await grupoActual();

  return (
    <GroupSummaryScreen basePath="/demo" group={group} season={season} me={me} summary={summary} />
  );
}
