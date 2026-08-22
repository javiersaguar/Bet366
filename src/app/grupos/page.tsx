import { requireSession } from '@/lib/sesion';
import { signOutAction } from '@/lib/actions';
import { GroupsScreen, type GroupEntry } from '@/screens/groups';

export const dynamic = 'force-dynamic';

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string }>;
}) {
  const { codigo } = await searchParams;
  const invitacion = (codigo ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  const { supabase, user } = await requireSession(
    invitacion ? `/grupos?codigo=${invitacion}` : '/grupos',
  );

  /* `group_members` deja ver, por RLS, a todos los miembros de tus grupos, no
     solo tu propia fila. Sin este filtro un grupo de cinco personas salía
     cinco veces en la lista, cada una con el rol de otro. */
  const { data: memberships } = await supabase
    .from('group_members')
    .select('role, groups(id, name, invite_code, starting_points)')
    .eq('user_id', user.id)
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
      .eq('user_id', user.id);
    for (const s of seasons ?? []) {
      const b = (saldos ?? []).find(
        (r) => r.group_id === s.group_id && r.season_number === s.number,
      );
      if (b) balances.set(s.group_id, Number(b.points));
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const groups: GroupEntry[] = rows.map(({ group, role }) => ({
    id: group.id,
    name: group.name,
    inviteCode: group.invite_code,
    role,
    balance: balances.get(group.id) ?? 0,
    startingPoints: Number(group.starting_points ?? 0),
  }));

  return (
    <GroupsScreen
      profile={profile ?? null}
      groups={groups}
      onSignOut={signOutAction}
      codigoInvitacion={invitacion}
    />
  );
}
