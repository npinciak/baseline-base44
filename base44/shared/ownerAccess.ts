// Emails allowed to use owner-only tools (curriculum review). Currently the app owner.
export const OWNER_EMAILS = ['nathanp@base44.com'];

export function isOwner(user) {
  return !!user?.email && OWNER_EMAILS.includes(String(user.email).toLowerCase());
}

export function isOwnerOrAdmin(user) {
  return user?.role === 'admin' || isOwner(user);
}