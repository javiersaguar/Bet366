import { requireSession } from '@/lib/sesion';
import { joinGroupAction, signOutAction } from '@/lib/actions';
import { GroupsScreen, type GroupEntry } from '@/screens/groups';
import { ultimaActividad, type AvisoActivo, type MercadoActivo } from '@/lib/actividad';

export const dynamic = 'force-dynamic';

/** Cuántas apuestas y avisos se miran para calcular «lo último que pasó». */
const TOPE_MERCADOS = 300;
const TOPE_AVISOS = 200;

/**
 * Tus grupos. Es la primera pantalla al abrir la app con la sesión guardada.
 *
 * Todo lo que se pinta por fila viene de aquí: el saldo de la semana en curso,
 * los avisos tuyos sin leer y lo último que se movió dentro, que es lo que
 * manda el orden de la lista.
 */
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
    .select('groups(id, name, invite_code, starting_points)')
    .eq('user_id', user.id)
    .order('joined_at');

  const rows = (memberships ?? [])
    .map(
      (m) =>
        m.groups as unknown as {
          id: string;
          name: string;
          invite_code: string;
          starting_points: number;
        },
    )
    .filter(Boolean);

  const ids = rows.map((g) => g.id);

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (ids.length === 0) {
    return (
      <GroupsScreen
        profile={profile ?? null}
        groups={[]}
        join={joinGroupAction}
        onSignOut={signOutAction}
        codigoInvitacion={invitacion}
      />
    );
  }

  const [{ data: seasons }, { data: saldos }, { data: gente }, { data: mercados }, { data: avisos }] =
    await Promise.all([
      supabase.from('seasons').select('group_id, number').is('closed_at', null).in('group_id', ids),
      supabase.from('balances').select('group_id, season_number, points').eq('user_id', user.id),
      supabase.from('group_members').select('group_id').in('group_id', ids),
      /* Lo justo para saber cuándo se movió cada apuesta. Sin traerse las
         opciones ni el creador: esta pantalla no pinta ninguna apuesta. */
      supabase
        .from('markets')
        .select('group_id, title, status, created_at, closes_at, result_set_at, resolved_at')
        .in('group_id', ids)
        .order('created_at', { ascending: false })
        .limit(TOPE_MERCADOS),
      /* Los avisos ya vienen redactados y son solo tuyos: la política de filas
         no deja ver los de nadie más. */
      supabase
        .from('notifications')
        .select('group_id, kind, title, created_at, read_at')
        .in('group_id', ids)
        .order('created_at', { ascending: false })
        .limit(TOPE_AVISOS),
    ]);

  // Saldo actual en cada grupo (semana abierta).
  const balances = new Map<string, number>();
  for (const s of seasons ?? []) {
    const b = (saldos ?? []).find((r) => r.group_id === s.group_id && r.season_number === s.number);
    if (b) balances.set(s.group_id, Number(b.points));
  }

  const cuantos = new Map<string, number>();
  for (const g of gente ?? []) cuantos.set(g.group_id, (cuantos.get(g.group_id) ?? 0) + 1);

  const porGrupo = <T extends { group_id: string }>(filas: T[] | null) => {
    const mapa = new Map<string, T[]>();
    for (const f of filas ?? []) {
      const lista = mapa.get(f.group_id);
      if (lista) lista.push(f);
      else mapa.set(f.group_id, [f]);
    }
    return mapa;
  };

  const mercadosPorGrupo = porGrupo(mercados as (MercadoActivo & { group_id: string })[] | null);
  const avisosPorGrupo = porGrupo(avisos as (AvisoActivo & { group_id: string })[] | null);

  const groups: GroupEntry[] = rows.map((group) => {
    const mios = avisosPorGrupo.get(group.id) ?? [];
    return {
      id: group.id,
      name: group.name,
      inviteCode: group.invite_code,
      balance: balances.get(group.id) ?? 0,
      startingPoints: Number(group.starting_points ?? 0),
      members: cuantos.get(group.id) ?? 1,
      unread: mios.filter((n) => n.read_at === null).length,
      activity: ultimaActividad(mercadosPorGrupo.get(group.id) ?? [], mios),
    };
  });

  return (
    <GroupsScreen
      profile={profile ?? null}
      groups={groups}
      join={joinGroupAction}
      onSignOut={signOutAction}
      codigoInvitacion={invitacion}
    />
  );
}
