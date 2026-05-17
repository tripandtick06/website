// B2B dashboard server-wrapper — CF Pages (next-on-pages) build icin
// dynamic lambda generation forcele. Client-only fetch /api/b2b/auth/me ile
// auth gate yapan DashboardClient'a delegate.

import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default function B2BDashboardPage() {
  return <DashboardClient />;
}
