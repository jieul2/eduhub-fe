import { Spinner } from "@/components/ui/Spinner/Spinner";

export default function Loading() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" className="text-primary" />
        <p className="text-sm font-medium text-muted">데이터를 불러오는 중입니다...</p>
      </div>
    </div>
  );
}
