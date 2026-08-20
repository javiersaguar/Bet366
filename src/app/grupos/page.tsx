import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { points } from '@/lib/format';
import { JoinGroupForm } from './join-form';
import { Empty } from '@/components/ui';
import { signOutAction } from '@/lib/actions';

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

  const groups = (memberships ?? [])
    .map((m) => ({ role: m.role, group: m.groups as unknown as { id: string; name: string; invite_code: string } }))
    .filter((m) => m.group);

  // Saldo actual en cada grupo (semana abierta).
  const balances = new Map<string, number>();
  if (groups.length > 0) {
    const { data: seasons } = await supabase
      .from('seasons')
      .select('group_id, number')
      .is('closed_at', null);
    const { data: rows } = await supabase
      .from('balances')
      .select('group_id, season_number, points')
      .eq('user_id', user!.id);
    for (const s of seasons ?? []) {
      const b = (rows ?? []).find((r) => r.group_id === s.group_id && r.season_number === s.number);
      if (b) balances.set(s.group_id, Number(b.points));
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_emoji')
    .eq('id', user!.id)
    .single();

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8 pb-24">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-content-muted">Hola, {profile?.display_name ?? 'crack'}</p>
          <h1 className="text-2xl font-bold text-white">Tus grupos</h1>
        </div>
        <form action={signOutAction}>
          <button className="btn-ghost !px-3 !py-2 text-xs">Salir</button>
        </form>
      </header>

      {groups.length === 0 ? (
        <Empty
          icon="🫂"
          title="Todavía no estás en ningún grupo"
          hint="Crea uno para tu pandilla o entra con el código que te hayan pasado."
        />
      ) : (
        <ul className="space-y-3">
          {groups.map(({ group, role }) => (
            <li key={group.id}>
              <Link
                href={`/grupos/${group.id}`}
                className="card flex items-center justify-between gap-4 px-5 py-4 transition hover:border-brand/40 hover:bg-surface-raised"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{group.name}</p>
                  <p className="text-xs text-content-muted">
                    {role === 'owner' ? 'Eres el jefe' : 'Miembro'} · código{' '}
                    <span className="num text-content-muted">{group.invite_code}</span>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="num text-lg font-bold text-brand">
                    {points(balances.get(group.id) ?? 0)}
                  </p>
                  <p className="eyebrow">puntos</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <JoinGroupForm />
        <Link
          href="/grupos/nuevo"
          className="card grid place-content-center gap-1 px-5 py-6 text-center transition hover:border-brand/40 hover:bg-surface-raised"
        >
          <span className="text-2xl">🎯</span>
          <span className="font-semibold text-white">Crear un grupo</span>
          <span className="text-xs text-content-muted">Y repartir el código a la pandilla</span>
        </Link>
      </div>
    </main>
  );
}
