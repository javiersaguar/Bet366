import { GroupsScreen } from '@/screens/groups';
import { DemoBanner } from '@/components/demo-banner';
import { ultimaActividad } from '@/lib/actividad';
import { grupoActual, misGruposDemo } from '@/app/demo/estado';
import { cambiarGrupoDemo, unirseDemoAction } from '@/app/demo/acciones';

export const metadata = { title: 'Tus grupos' };

/**
 * Tus grupos, en la demostración.
 *
 * Es la misma pantalla que en la app de verdad, con los mismos datos por fila.
 * Lo único distinto es qué pasa al tocar una: aquí no se navega a otra
 * dirección, se guarda el grupo elegido en una cookie y se vuelve al tablón,
 * que es lo que hace que todo lo de arriba cambie de golpe.
 */
export default async function DemoGroupsPage() {
  const grupos = await misGruposDemo();
  const actual = await grupoActual();

  const entradas = grupos.map((g) => ({
    id: g.id,
    name: g.group.name,
    inviteCode: g.group.invite_code,
    balance: g.balance,
    startingPoints: g.group.starting_points,
    members: g.members.length,
    unread: g.notifications.filter((n) => n.read_at === null).length,
    activity: ultimaActividad([...g.markets, ...g.pastMarkets], g.notifications),
  }));

  return (
    <>
      <div className="barra-superior sticky top-0 z-30 bg-canvas/85 backdrop-blur-xl">
        <DemoBanner />
      </div>

      <GroupsScreen
        demo
        profile={actual.me}
        groups={entradas}
        currentId={actual.id}
        join={unirseDemoAction}
        onSelect={cambiarGrupoDemo}
      />
    </>
  );
}
