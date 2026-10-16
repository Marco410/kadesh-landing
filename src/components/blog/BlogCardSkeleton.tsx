import { Bone, boneWidth } from 'kadesh/components/ui/skeleton';

const TITLE_WIDTHS = ['72%', '56%', '64%', '48%'] as const;
const EXCERPT_WIDTHS = ['84%', '68%', '76%', '60%'] as const;

/** Silueta de `BlogCard`, con sus mismas medidas. */
export default function BlogCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-[#f5f5f5] dark:bg-[#1e1e1e]">
      <Bone kind="box" height={192} radius={0} />

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-center gap-2">
          <Bone kind="circle" width={32} />
          <Bone kind="line" slot={16} width={120} />
        </div>

        <div className="mb-3">
          <Bone kind="line" slot={24} width="100%" />
          <Bone kind="line" slot={24} width={boneWidth(TITLE_WIDTHS, index)} />
        </div>

        <div className="mb-3">
          <Bone kind="line" slot={20} width="100%" />
          <Bone kind="line" slot={20} width={boneWidth(EXCERPT_WIDTHS, index)} />
        </div>

        <div className="mt-auto flex items-center gap-4 pt-3">
          <Bone kind="line" slot={20} width={36} />
          <Bone kind="line" slot={20} width={36} />
          <Bone kind="box" width={16} height={16} radius={4} className="ml-auto" />
        </div>
      </div>
    </div>
  );
}
