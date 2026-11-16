"use client";
import { PropsWithChildren, ReactNode, useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { cn } from "@/shared/lib/util/cn";

interface InfiniteScrollProps extends PropsWithChildren {
  className?: string;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  loader: ReactNode;
}

function InfiniteScroll({
  className,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  loader,
  children,
}: InfiniteScrollProps) {
  const { ref, inView } = useInView();

  // 불러온 뒤에도 목록 끝이 여전히 보이면(항목이 적어 화면을 못 채운 경우) 이어서 불러옴
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className={cn("flex flex-col", className)}>
      {children}
      {isFetchingNextPage && loader}
      <div ref={ref} className="h-4" />
    </div>
  );
}

export default InfiniteScroll;
