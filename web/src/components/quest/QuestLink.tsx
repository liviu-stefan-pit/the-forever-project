import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { questHref } from "../../lib/questNav";

export function QuestLink({
  id,
  stepId,
  className,
  title,
  children,
}: {
  id: number;
  /** Card that owns this link. On /guide/ routes this replaces the `step` search param. */
  stepId?: string;
  className?: string;
  title?: string;
  children: ReactNode;
}) {
  const loc = useLocation();
  return (
    <Link to={questHref(id, loc, stepId)} className={className} title={title}>
      {children}
    </Link>
  );
}
