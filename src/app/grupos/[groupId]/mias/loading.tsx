import { SkeletonRows } from '@/components/skeleton';

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-3">
        <div className="skeleton h-[74px] rounded-2xl" />
        <div className="skeleton h-[74px] rounded-2xl" />
        <div className="skeleton h-[74px] rounded-2xl" />
      </div>
      <SkeletonRows />
    </div>
  );
}
