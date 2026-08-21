import { createClient } from '@/lib/supabase/server';
import { signOutAction } from '@/lib/actions';
import { GroupsScreen, type GroupEntry } from '@/screens/groups';

export const dynamic = 'force-dynamic';

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from('group_members')
    .select('role, groups(id, name, invite_code, starting_points)')
    .order('joined_at');

  const rows = (memberships ?? [])
    .map((m) => ({
      role: m.role,
      group: m.groups as unknown as {
        id: string;
        name: string;
        invite_code: string;
        starting_points: number;
      },
    }))
    .filter((m) => m.group);

  // Saldo actual en cada grupo (semana abierta).
  const balances = new Map<string, number>();
  if (rows.length > 0) {
    const { data: seasons } = await supabase
      .from('seasons')
      .select('group_id, number')
      .is('closed_at', null);
    const { data: saldos } = await supabase
      .from('balances')
      .select('group_id, season_number, points')
      .eq('user_id', user!.id);
    for (const s of seasons ?? []) {
      const b = (saldos ?? []).find((r) => r.group_id === s.group_id && r.season_number === s.number);
      if (b) balances.set(s.group_id, Number(b.points));
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_symbol, avatar_color')
    .eq('id', user!.id)
    .single();

  const groups: GroupEntry[] = rows.map(({ group, role }) => ({
    id: group.id,
    name: group.name,
    inviteCode: group.invite_code,
    role,
    balance: balances.get(group.id) ?? 0,
    startingPoints: Number(group.starting_points ?? 0),
  }));

  return <GroupsScreen profile={profile ?? null} groups={groups} onSignOut={signOutAction} />;
}
