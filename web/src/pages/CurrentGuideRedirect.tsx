import { Navigate } from "react-router";
import { HORDE_HOME } from "../config";
import { useRoutePosition } from "../state/position";

/** `/guide` with no slug: open the guide you are on (the dashboard until the route position is known). */
export function CurrentGuideRedirect() {
  const pos = useRoutePosition();
  return <Navigate to={pos.guideSlug ? `/guide/${pos.guideSlug}` : HORDE_HOME} replace />;
}
