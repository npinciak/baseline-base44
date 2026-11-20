export function getDisplayName(user, profile) {
  if (user?.display_name?.trim()) return user.display_name.trim();
  const fromProfile = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '';
  return fromProfile || user?.full_name?.trim() || '';
}

export function getGreetingName(user, profile) {
  if (user?.display_name?.trim()) return user.display_name.trim();
  return profile?.first_name?.trim() || user?.full_name?.trim()?.split(' ')[0] || 'there';
}

export function getInitial(user, profile) {
  const name = getDisplayName(user, profile);
  return name?.[0]?.toUpperCase() || 'U';
}