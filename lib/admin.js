/**
 * Admin access is an explicit allowlist in the environment rather than a
 * database flag, so a compromised account cannot promote itself.
 * ADMIN_EMAILS=you@example.com,partner@example.com
 */
export function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdmin(user) {
  if (!user?.email) return false;
  // Anyone can create an unverified account with any address, so the
  // allowlist only counts once Firebase has confirmed the owner holds it.
  if (!user.emailVerified) return false;
  const list = adminEmails();
  // With no allowlist configured nobody is an admin — failing closed matters
  // more here than convenience.
  if (!list.length) return false;
  return list.includes(user.email.toLowerCase());
}
