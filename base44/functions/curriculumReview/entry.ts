import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { isOwner } from '../../shared/ownerAccess.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { mode, review, rows } = await req.json().catch(() => ({}));
    const allowed = isOwner(user);
    if (mode === 'check') return Response.json({ allowed });
    if (!allowed) return Response.json({ error: 'Owner access required' }, { status: 403 });
    if (mode === 'save') {
      if (!review || typeof review.tool_key !== 'string' || !['keep','review','planned','removed'].includes(review.decision) || typeof review.note !== 'string' || review.note.length > 3000) return Response.json({error:'Invalid review'},{status:400});
      const existing = await base44.asServiceRole.entities.MoneyToolReview.filter({tool_key:review.tool_key},{limit:1});
      const data = {tool_key:review.tool_key,decision:review.decision,note:review.note};
      const saved = existing.items.length ? await base44.asServiceRole.entities.MoneyToolReview.update(existing.items[0].id,data) : await base44.asServiceRole.entities.MoneyToolReview.create(data);
      return Response.json({review:saved});
    }
    if (mode === 'export') {
      if (!Array.isArray(rows) || rows.length > 100) return Response.json({error:'Invalid export'},{status:400});
      const quote = value => '"' + String(value ?? '').replace(/^[=+@-]/,"'").replace(/"/g,'""') + '"';
      const csv = [['Tool','Chapter','Practical action','Decision','Audit','Owner notes'],...rows.map(r=>[r.label,r.chapterLabel,r.move,r.decision,r.audit,r.note])].map(r=>r.map(quote).join(',')).join('\r\n');
      return Response.json({csv});
    }
    const [res, reviews] = await Promise.all([base44.functions.invoke('getPayloadLessons', {}),base44.asServiceRole.entities.MoneyToolReview.list({limit:100})]);
    return Response.json({ allowed: true, modules: res?.data?.modules || [], reviews:reviews.items });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}