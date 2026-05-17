// Hesabim server-wrapper — CF Pages (next-on-pages) build icin
// dynamic lambda generation forcele. Client-only localStorage booking list
// + fetch HesabimClient'a delegate.

import HesabimClient from "./HesabimClient";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default function HesabimPage() {
  return <HesabimClient />;
}
