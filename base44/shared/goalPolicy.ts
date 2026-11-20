export async function goalSubscription(base44, user) {
  if (user?.role === 'admin') return { paid: true, freeGoalLimit: 1 };
  const result = await base44.asServiceRole.entities.SubscriptionEntitlement.filter({user_id:user.id,status:'active',expires_at:{$gt:new Date().toISOString()}},{limit:1});
  return { paid:result.items.length > 0, freeGoalLimit:1 };
}

export async function requireGoalLessons(base44, user) {
  if (user?.role === 'admin') return true;
  const [content, progress] = await Promise.all([
    base44.functions.invoke('getPayloadLessons',{}),
    base44.entities.UserProgress.filter({user_id:user.id,completed:true,module_id:{$in:['34','40','37','bl-paycheck']}},{limit:200})
  ]);
  // Chapter 1's four curriculum units, including its paycheck lesson.
  const ids = ['34','40','37','bl-paycheck'];
  const units = (content.data?.modules || []).filter(m=>ids.includes(String(m.id)));
  const done = new Set(progress.items.map(p=>String(p.lesson_id)));
  return units.length === ids.length && units.every(m=>m.lessons?.length > 0 && m.lessons.every(l=>done.has(String(l.id))));
}

export async function freeGoalId(profileId) {
  // The existing goals primary key makes parallel free-goal inserts mutually exclusive.
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`baseline-emergency:${profileId}`)));
  digest[6]=(digest[6]&15)|80; digest[8]=(digest[8]&63)|128;
  const hex=Array.from(digest.slice(0,16),b=>b.toString(16).padStart(2,'0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}