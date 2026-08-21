import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { points } from '@/lib/format';
import { JoinGroupForm } from './join-form';
import { Empty } from '@/components/ui';
import { Avatar } from '@/components/avatar';
import { IconTarget } from '@/components/icons';
import { Wordmark } from '@/components/logo';
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
    .select('display_name, avatar_symbol, avatar_color')
    .eq('id', user!.id)
    .single();

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8 pb-24">
      <header className="animate-rise mb-8">
        <div className="mb-7 flex items-center justify-between">
          <Wordmark className="text-lg" />
          <form action={signOutAction}>
            <button className="btn-quiet !px-3 !py-1.5 text-2xs">Salir</button>
          </form>
        </div>
        <div className="flex items-center gap-3.5">
          {profile && (
            <Avatar
              profile={{
                id: user!.id,
                avatar_symbol: profile.avatar_symbol,
                avatar_color: profile.avatar_color,
              }}
              size="lg"
              ring="brand"
            />
          )}
          <div>
            <p className="text-sm text-content-muted">Hola, {profile?.display_name ?? 'crack'}</p>
            <h1 className="text-2xl font-bold text-white">Tus grupos</h1>
          </div>
        </div>
      </header>

      {groups.length === 0 ? (
        <Empty
          title="Todavía no estás en ningún grupo"
          hint="Crea uno para tu pandilla o entra con el código que te hayan pasado."
        />
      ) : (
        <ul className="stagger space-y-3">
          {groups.map(({ group, role }, i) => (
            <li key={group.id} style={{ '--i': i } as React.CSSProperties}>
              <Link
                href={`/grupos/${group.id}`}
                className="card-interactive flex items-center justify-between gap-4 px-5 py-4 hover:border-brand/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{group.name}</p>
                  <p className="text-2xs text-content-faint">
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
          className="card-interactive grid place-content-center gap-1 px-5 py-6 text-center hover:border-brand/40"
        >
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface-sunken text-brand">
            <IconTarget className="h-5 w-5" />
          </span>
          <span className="font-semibold text-white">Crear un grupo</span>
          <span className="text-2xs text-content-muted">Y repartir el código a la pandilla</span>
        </Link>
      </div>
    </main>
  );
}
