import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { isOwner } from '../../shared/ownerAccess.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { mode } = await req.json().catch(() => ({}));
    const allowed = isOwner(user);
    if (mode === 'check') return Response.json({ allowed });
    if (!allowed) return Response.json({ error: 'Owner access required' }, { status: 403 });
    const res = await base44.functions.invoke('getPayloadLessons', {});
    return Response.json({ allowed: true, modules: res?.data?.modules || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}