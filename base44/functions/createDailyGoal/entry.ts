import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function(req) {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(e=>e.status === 401 ? null : Promise.reject(e));
  if (!user) return Response.json({error:'Unauthorized'},{status:401});
  if (user.role !== 'admin') return Response.json({error:'Forbidden'},{status:403});
  // Automatic demo goals must not bypass the learner's chapter or subscription rules.
  // Existing goals are preserved. The workflow's configured status is unchanged.
  return Response.json({success:true,skipped:true,reason:'Savings goals are learner-created after chapter completion. Automatic sample-goal creation is disabled.'});
}