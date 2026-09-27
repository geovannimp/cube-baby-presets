import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const PresetCardSkeleton = () => (
  <Card
    aria-hidden
    className="mx-auto h-full w-full max-w-sm overflow-hidden py-0"
  >
    <CardContent className="flex flex-1 flex-col justify-between gap-4 px-6 pt-5 pb-4">
      <div className="flex min-w-0 flex-col gap-1.5">
        <Skeleton className="h-6 w-2/3 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
      </div>

      <Skeleton className="h-9 w-32 self-start rounded-md" />

      <div className="flex min-h-6 items-center gap-3">
        <Skeleton className="h-4 w-14 rounded-md" />
        <Skeleton className="h-4 w-14 rounded-md" />
      </div>
    </CardContent>

    <CardFooter className="mt-auto p-0">
      <div className="flex w-full items-center justify-between gap-3 px-6 py-3">
        <Skeleton className="h-7 w-24 rounded-md" />
        <Skeleton className="h-4 w-24 rounded-md" />
      </div>
    </CardFooter>
  </Card>
);
