import { NavLink } from "react-router";
import { HORDE_HOME } from "../../config";
import { useRoutePosition } from "../../state/position";

export const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-touch items-center rounded-sm px-2.5 text-sm font-medium transition ${isActive ? "bg-horde-700/50 text-bronze-300" : "text-bronze-500/80 hover:text-ink"}`;

/** Dashboard / Guide / Overview. Guide appears once the route position knows the current guide. */
export function MainNavLinks({ guideSlug, onNavigate, linkClass = navLinkClass }: { guideSlug?: string; onNavigate?: () => void; linkClass?: typeof navLinkClass }) {
  return (
    <>
      <NavLink to={HORDE_HOME} end className={linkClass} onClick={onNavigate}>
        Dashboard
      </NavLink>
      {guideSlug && (
        <NavLink to={`/guide/${guideSlug}`} className={linkClass} onClick={onNavigate}>
          Guide
        </NavLink>
      )}
      <NavLink to="/overview" className={linkClass} onClick={onNavigate}>
        Overview
      </NavLink>
    </>
  );
}

export const drawerLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-touch flex-1 items-center justify-center rounded-sm px-2 text-sm font-semibold transition ${
    isActive ? "bg-horde-700/50 text-bronze-300 ring-1 ring-horde-400/50" : "text-bronze-500/80 hover:bg-canvas hover:text-ink"
  }`;

/** Phone/tablet: the main nav lives at the top of the timeline drawer (the top bar hides it below xl). */
export function DrawerNavView({ guideSlug, onNavigate }: { guideSlug?: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="flex gap-1 border-b border-stroke py-2 pl-2 pr-12">
      <MainNavLinks guideSlug={guideSlug} onNavigate={onNavigate} linkClass={drawerLinkClass} />
    </nav>
  );
}

export function DrawerNav({ onNavigate }: { onNavigate?: () => void }) {
  const pos = useRoutePosition();
  return <DrawerNavView guideSlug={pos.guideSlug} onNavigate={onNavigate} />;
}
