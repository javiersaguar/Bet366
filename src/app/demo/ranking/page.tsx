import { RankingScreen } from '@/screens/ranking';
import { GROUP, ME, MEMBERS, PEOPLE, SEASON, STANDINGS } from '@/lib/fixtures';

export default function DemoRanking() {
  return (
    <RankingScreen basePath="/demo"
      group={GROUP}
      season={SEASON}
      me={ME}
      members={MEMBERS}
      standings={STANDINGS}
      history={[
        { season_number: 2, points: 2140, user_id: PEOPLE.marcos.id },
        { season_number: 1, points: 1880, user_id: PEOPLE.javi.id },
      ]}
    />
  );
}
