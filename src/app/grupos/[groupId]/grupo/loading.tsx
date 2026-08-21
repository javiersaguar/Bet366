import { SkeletonRows } from '@/components/skeleton';

export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="skeleton h-8 w-52" />
      <div className="skeleton h-16 w-full" />
      <SkeletonRows rows={5} />
    </div>
  );
}
