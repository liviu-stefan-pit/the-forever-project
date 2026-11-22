/** 404 and re-exports. Quest and overview pages live in their own files (P9). */
import { Link } from "react-router";
import { EmptyState } from "../components/ui/States";
import { HORDE_HOME } from "../config";

export { ProfilePage } from "./ProfilePage";
export { QuestPage } from "./QuestPage";
export { OverviewPage } from "./OverviewPage";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-3 py-7 sm:px-6">
      <header className="panel-animate space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-bronze-400">404</p>
        <h1 className="font-display text-3xl font-bold text-bronze-400">Lost in the Barrens</h1>
      </header>
      <EmptyState icon="map" title="This page does not exist">
        <Link to={HORDE_HOME} className="text-bronze-400 hover:text-bronze-300">
          Back to the dashboard
        </Link>
      </EmptyState>
    </div>
  );
}
