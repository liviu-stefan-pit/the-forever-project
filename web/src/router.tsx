import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { createBrowserRouter } from "react-router";
import { AppShell } from "./components/layout/AppShell";
import { InfoShell } from "./components/layout/InfoShell";
import { GuideSkeleton } from "./components/ui/States";
import { HORDE_HOME } from "./config";

/**
 * Path routing (`/horde`, no `#`). Cloudflare Pages serves index.html for unknown paths, and
 * legacyHash.ts turns old `#/…` links into paths before the router starts.
 * Step deep link: `/guide/<slug>?step=<step id>` (URL-encoded).
 * Pages are lazy; the shell and providers stay in the first chunk.
 */
function page(load: () => Promise<{ default: ComponentType }>, fallback: ReactNode = <PageFallback />): ReactNode {
  const Page = lazy(load);
  return (
    <Suspense fallback={fallback}>
      <Page />
    </Suspense>
  );
}

/** Same skeleton GuidePage shows while guide data is loading. */
function PageFallback() {
  return (
    <div className="mx-auto max-w-3xl px-3 py-7 sm:px-6">
      <GuideSkeleton />
    </div>
  );
}

const LandingPage = () => import("./pages/LandingPage").then((m) => ({ default: m.LandingPage }));
const DashboardPage = () => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage }));
const GuidePage = () => import("./pages/GuidePage").then((m) => ({ default: m.GuidePage }));
const QuestPage = () => import("./pages/QuestPage").then((m) => ({ default: m.QuestPage }));
const GoldPage = () => import("./pages/GoldPage").then((m) => ({ default: m.GoldPage }));
const CurrentGuideRedirect = () => import("./pages/CurrentGuideRedirect").then((m) => ({ default: m.CurrentGuideRedirect }));
const TransferPage = () => import("./pages/TransferPage").then((m) => ({ default: m.TransferPage }));
const OverviewPage = () => import("./pages/OverviewPage").then((m) => ({ default: m.OverviewPage }));
const ProfilePage = () => import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage }));
const CreditsPage = () => import("./pages/CreditsPage").then((m) => ({ default: m.CreditsPage }));
const AboutPage = () => import("./pages/AboutPage").then((m) => ({ default: m.AboutPage }));
const AddonsPage = () => import("./pages/AddonsPage").then((m) => ({ default: m.AddonsPage }));
const NotFoundPage = () => import("./pages/PlaceholderPages").then((m) => ({ default: m.NotFoundPage }));

export const router = createBrowserRouter([
  // The faction landing page is full-screen, outside the app shell; it has its own background.
  { path: "/", element: page(LandingPage, null) },
  // Site-wide pages (not part of the Horde section): plain header, shared footer.
  {
    element: <InfoShell />,
    children: [
      { path: "/about", element: page(AboutPage) },
      { path: "/credits", element: page(CreditsPage) },
      { path: "/addons", element: page(AddonsPage) },
    ],
  },
  {
    element: <AppShell />,
    children: [
      { path: HORDE_HOME, element: page(DashboardPage) },
      { path: "/guide", element: page(CurrentGuideRedirect) },
      { path: "/guide/:slug", element: page(GuidePage) },
      { path: "/gold", element: page(GoldPage) },
      { path: "/transfer", element: page(TransferPage) },
      { path: "/quest/:id", element: page(QuestPage) },
      { path: "/overview", element: page(OverviewPage) },
      { path: "/profile", element: page(ProfilePage) },
      { path: "*", element: page(NotFoundPage) },
    ],
  },
]);
