import Link from 'next/link';
import { NewGroupForm } from './form';

export default function NewGroupPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-5 py-8 pb-24">
      <Link href="/grupos" className="mb-6 inline-block text-sm text-content-muted hover:text-content">
        ← Tus grupos
      </Link>
      <h1 className="text-2xl font-bold text-white">Crear un grupo</h1>
      <p className="mt-1 mb-8 text-sm text-content-muted">
        Los ajustes se pueden dejar como están: son los que mejor funcionan.
      </p>
      <NewGroupForm />
    </main>
  );
}
