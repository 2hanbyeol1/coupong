"use client";
import { PropsWithChildren, ReactNode, useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { cn } from "@/shared/lib/util/cn";

interface InfiniteScrollProps extends PropsWithChildren {
  className?: string;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  loader: ReactNode;
}

function InfiniteScroll({
  className,
  fetchNextPage,
  isFetchingNextPage,
  loader,
  children,
}: InfiniteScrollProps) {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <div className={cn("flex flex-col", className)}>
      {children}
      {isFetchingNextPage && loader}
      <div ref={ref} className="h-4" />
    </div>
  );
}

export default InfiniteScroll;
