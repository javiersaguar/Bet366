import { SkeletonRows } from '@/components/skeleton';

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-5 w-56" />
      <SkeletonRows rows={4} />
    </div>
  );
}
