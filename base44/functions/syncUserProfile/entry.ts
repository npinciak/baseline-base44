import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const headers = { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json' };

    // Step 1: Resolve canonical next_auth UUID (mirrors ensureUserProfile logic)
    let nextAuthUserId = isUuid(user.id) ? user.id : null;

    if (!nextAuthUserId && user.email) {
      const lookupRes = await fetch(
        `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(user.email)}&select=id&limit=1`,
        { headers: { ...headers, 'Accept-Profile': 'next_auth' } }
      );
      const rows = await lookupRes.json();
      nextAuthUserId = rows?.[0]?.id ?? null;
    }

    if (!nextAuthUserId) {
      return Response.json({ error: 'Could not resolve next_auth user UUID' }, { status: 400 });
    }

    const nameParts = (user.full_name || '').trim().split(' ');
    const firstName = nameParts[0] || null;
    const lastName = nameParts.slice(1).join(' ') || null;
    const now = new Date().toISOString();

    // Step 2: Try update first
    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${nextAuthUserId}`,
      {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, updated_at: now }),
      }
    );
    const updatedRows = await updateRes.json();

    if (Array.isArray(updatedRows) && updatedRows.length > 0) {
      return Response.json({ profile: updatedRows[0], action: 'updated' });
    }

    // Step 3: No existing row — insert
    const insertRes = await fetch(
      `${supabaseUrl}/rest/v1/user_profiles`,
      {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
          user_id: nextAuthUserId,
          first_name: firstName,
          last_name: lastName,
          created_at: now,
          updated_at: now,
        }),
      }
    );
    const insertResult = await insertRes.json();

    if (!insertRes.ok) {
      return Response.json({ error: insertResult }, { status: insertRes.status });
    }

    return Response.json({ profile: insertResult[0], action: 'created' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});