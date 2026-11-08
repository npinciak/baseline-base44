import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const norm = (e) => String(e || '').trim().toLowerCase();

// All family reads/writes go through here so each user only sees their own household.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const db = base44.asServiceRole.entities;
    const email = norm(user.email);

    const myMembership = async () => (await db.FamilyMember.filter({ user_id: user.id, status: 'active' }, '-created_date', 1))[0] || null;
    const requireParent = async () => {
      const me = await myMembership();
      return me && me.role === 'parent' ? me : null;
    };

    if (action === 'get') {
      const me = await myMembership();
      const invites = me ? [] : await db.FamilyMember.filter({ email, status: 'invited' }, '-created_date', 20);
      const inviteFamilies = invites.length ? await db.Family.filter({ id: { $in: invites.map(i => i.family_id) } }) : [];
      const pending = invites.map(i => ({ id: i.id, display_name: i.display_name, role: i.role, family_name: inviteFamilies.find(f => f.id === i.family_id)?.name || 'A family' }));
      if (!me) return Response.json({ family: null, me: null, members: [], pending });
      const family = await db.Family.get(me.family_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      const members = await db.FamilyMember.filter({ family_id: me.family_id }, 'created_date', 50);
      return Response.json({
        family, me: { id: me.id, role: me.role },
        members: members.map(m => ({ id: m.id, display_name: m.display_name, role: m.role, status: m.status, email: me.role === 'parent' ? m.email : undefined, is_me: m.id === me.id })),
        pending: [],
      });
    }

    if (action === 'create') {
      if (await myMembership()) return Response.json({ error: 'You are already in a family account' }, { status: 400 });
      const name = String(body.name || '').trim().slice(0, 60) || 'My Family';
      const family = await db.Family.create({ name, owner_user_id: user.id });
      await db.FamilyMember.create({ family_id: family.id, email, display_name: user.full_name || 'Parent', user_id: user.id, role: 'parent', status: 'active' });
      return Response.json({ ok: true });
    }

    if (action === 'invite') {
      const me = await requireParent();
      if (!me) return Response.json({ error: 'Only a parent can invite members' }, { status: 403 });
      const inviteEmail = norm(body.email);
      const display_name = String(body.display_name || '').trim().slice(0, 40);
      const role = body.role === 'parent' ? 'parent' : 'child';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail) || !display_name) return Response.json({ error: 'Enter a name and a valid email' }, { status: 400 });
      const existing = await db.FamilyMember.filter({ family_id: me.family_id, email: inviteEmail }, '-created_date', 1);
      if (existing.length) return Response.json({ error: 'That person is already in your family' }, { status: 400 });
      await db.FamilyMember.create({ family_id: me.family_id, email: inviteEmail, display_name, role, status: 'invited' });
      let appInviteSent = true;
      await base44.users.inviteUser(inviteEmail, 'user').catch(() => { appInviteSent = false; });
      return Response.json({ ok: true, appInviteSent });
    }

    if (action === 'accept' || action === 'decline') {
      const invite = await db.FamilyMember.get(body.member_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!invite || invite.status !== 'invited' || norm(invite.email) !== email) return Response.json({ error: 'Invite not found' }, { status: 404 });
      if (action === 'decline') { await db.FamilyMember.delete(invite.id); return Response.json({ ok: true }); }
      if (await myMembership()) return Response.json({ error: 'You are already in a family account' }, { status: 400 });
      await db.FamilyMember.update(invite.id, { user_id: user.id, status: 'active' });
      return Response.json({ ok: true });
    }

    if (action === 'remove') {
      const me = await myMembership();
      if (!me) return Response.json({ error: 'Not in a family' }, { status: 403 });
      const target = await db.FamilyMember.get(body.member_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!target || target.family_id !== me.family_id) return Response.json({ error: 'Member not found' }, { status: 404 });
      const self = target.id === me.id;
      if (!self && me.role !== 'parent') return Response.json({ error: 'Only a parent can remove members' }, { status: 403 });
      if (self && me.role === 'parent') {
        const parents = await db.FamilyMember.filter({ family_id: me.family_id, role: 'parent', status: 'active' });
        if (parents.length <= 1) {
          // Last parent leaving closes the family and returns everyone to individual accounts.
          const all = await db.FamilyMember.filter({ family_id: me.family_id });
          await Promise.allSettled(all.map(m => db.FamilyMember.delete(m.id)));
          await db.Family.delete(me.family_id);
          return Response.json({ ok: true });
        }
      }
      await db.FamilyMember.delete(target.id);
      return Response.json({ ok: true });
    }

    if (action === 'progress') {
      const me = await requireParent();
      if (!me) return Response.json({ error: 'Only a parent can view progress' }, { status: 403 });
      const target = await db.FamilyMember.get(body.member_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!target || target.family_id !== me.family_id) return Response.json({ error: 'Member not found' }, { status: 404 });
      if (target.status !== 'active' || !target.user_id) return Response.json({ joined: false });
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const [stats, done, modRes] = await Promise.all([
        db.UserStats.filter({ user_id: target.user_id }, '-created_date', 1),
        db.UserProgress.filter({ user_id: target.user_id, completed: true }, '-completed_at', 1000),
        base44.functions.invoke('getPayloadLessons', {}),
      ]);
      const s = stats[0] || {};
      const doneIds = new Set(done.map(p => p.lesson_id));
      const lastAt = {};
      done.forEach(p => { if (!lastAt[p.module_id] || p.completed_at > lastAt[p.module_id]) lastAt[p.module_id] = p.completed_at; });
      const modules = modRes?.data?.modules || [];
      const finished = modules
        .filter(m => m.lessons.length && m.lessons.every(l => doneIds.has(l.id)))
        .map(m => ({ id: m.id, title: m.title, completed_at: lastAt[m.id] || null }))
        .sort((a, b) => String(b.completed_at || '').localeCompare(String(a.completed_at || '')));
      return Response.json({
        joined: true,
        streak: s.current_streak || 0,
        base_score: s.base_score ?? null,
        lessons_done: finished.length,
        lessons_total: modules.length,
        lessons_this_week: finished.filter(m => m.completed_at && m.completed_at >= weekAgo).length,
        recent: finished.slice(0, 3),
        last_active: s.last_activity_date || null,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}