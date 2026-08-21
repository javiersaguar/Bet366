import { ProfileScreen } from '@/screens/profile';
import { BALANCE, GROUP, ME, SEASON } from '@/lib/fixtures';

export default function DemoProfile() {
  return (
    <ProfileScreen basePath="/demo"
      me={ME}
      group={GROUP}
      season={SEASON}
      balance={BALANCE}
      stats={{ total: 6, won: 3, settled: 5, inPlay: 530 }}
    />
  );
}
