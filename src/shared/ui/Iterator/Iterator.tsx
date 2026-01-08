import { ReactNode } from "react";

interface IteratorProps {
  count: number;
  render: (idx: number) => ReactNode;
}

function Iterator({ count, render }: IteratorProps) {
  return Array.from({ length: count }).map((_, idx) => render(idx));
}

export default Iterator;
