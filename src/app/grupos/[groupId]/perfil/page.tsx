import { loadGroup } from '@/lib/data';
import { points } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import { ProfileEditor } from './editor';
import { SectionTitle } from '@/components/ui';
import { signOutAction } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const { me, group, season, balance } = await loadGroup(groupId);
  const supabase = await createClient();

  const { data: markets } = await supabase
    .from('markets')
    .select('id')
    .eq('group_id', groupId)
    .eq('season_number', season.number);

  const ids = (markets ?? []).map((m) => m.id);
  const { data: wagers } = ids.length
    ? await supabase.from('wagers').select('stake, status').in('market_id', ids).eq('user_id', me.id)
    : { data: [] as { stake: number; status: string }[] };

  const all = wagers ?? [];
  const won = all.filter((w) => w.status === 'won');
  const settled = all.filter((w) => w.status === 'won' || w.status === 'lost');
  const hitRate = settled.length > 0 ? Math.round((won.length / settled.length) * 100) : null;

  return (
    <div className="space-y-8">
      <ProfileEditor me={me} />

      <section>
        <SectionTitle>Tu semana</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Puntos" value={points(balance)} tone="brand" />
          <Stat
            label="Acierto"
            value={hitRate === null ? '—' : `${hitRate}%`}
            tone={hitRate !== null && hitRate >= 50 ? 'brand' : 'plain'}
          />
          <Stat label="Apuestas" value={String(all.length)} tone="plain" />
          <Stat
            label="En juego"
            value={points(all.filter((w) => w.status === 'active').reduce((a, w) => a + Number(w.stake), 0))}
            tone="info"
          />
        </div>
      </section>

      <section>
        <SectionTitle>Grupo</SectionTitle>
        <div className="card hairline overflow-hidden">
          <Row label="Nombre" value={group.name} />
          <Row label="Código de invitación" value={group.invite_code} mono />
          <Row label="Puntos por semana" value={points(group.starting_points)} mono />
          <Row label="Horas para impugnar" value={`${group.dispute_hours} h`} mono />
        </div>
      </section>

      <form action={signOutAction}>
        <button className="btn-ghost w-full !text-lose">Cerrar sesión</button>
      </form>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'brand' | 'info' | 'plain';
}) {
  const color = { brand: 'text-brand', info: 'text-info', plain: 'text-white' }[tone];
  return (
    <div className="card px-4 py-3.5">
      <p className="eyebrow !mb-1 !text-[0.625rem]">{label}</p>
      <p className={`num text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-sm text-content-muted">{label}</span>
      <span className={`text-sm font-semibold text-white ${mono ? 'num tracking-[0.12em]' : ''}`}>
        {value}
      </span>
    </div>
  );
}
