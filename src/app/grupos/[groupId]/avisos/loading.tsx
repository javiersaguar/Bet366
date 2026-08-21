import { SkeletonRows } from '@/components/skeleton';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-6 w-32" />
      <SkeletonRows rows={6} />
    </div>
  );
}
