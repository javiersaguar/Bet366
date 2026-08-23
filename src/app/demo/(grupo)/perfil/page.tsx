import { ProfileScreen } from '@/screens/profile';
import { grupoActual } from '@/app/demo/estado';

export default async function DemoProfile() {
  const { group, season, me, balance, stats } = await grupoActual();

  return (
    <ProfileScreen
      demo
      basePath="/demo"
      me={me}
      group={group}
      season={season}
      balance={balance}
      stats={stats}
    />
  );
}
