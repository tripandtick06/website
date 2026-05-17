// B2B login server-wrapper — CF Pages (next-on-pages) build icin
// dynamic lambda generation forcele. Client form + fetch /api/b2b/auth/login
// LoginClient'a delegate.

import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default function B2BLoginPage() {
  return <LoginClient />;
}
