import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function splitDisplayName(raw) {
  const cleaned = (raw || '').trim();
  if (!cleaned) return { firstName: null, lastName: null };
  const parts = cleaned.split(/\s+/);
  return {
    firstName: parts[0] || null,
    lastName: parts.slice(1).join(' ') || null,
  };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const bodyData = await req.json().catch(() => ({}));
    const isExplicitUpdate = bodyData?.action === 'update';

    const supabaseUrl = secrets.get('SUPABASE_URL');
    const serviceKey = secrets.get('SUPABASE_SERVICE_ROLE_KEY');
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    };

    let nextAuthUserId = isUuid(user.id) ? user.id : null;

    if (!nextAuthUserId && user.email) {
      const lookupRes = await fetch(
        `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(user.email)}&select=id&limit=1`,
        { headers: { ...headers, 'Accept-Profile': 'next_auth' }, signal: AbortSignal.timeout(10000) }
      );
      const rows = await lookupRes.json();
      nextAuthUserId = rows?.[0]?.id ?? null;
    }

    if (!nextAuthUserId) {
      return Response.json({ profile: null, skipped: true });
    }

    const existingRes = await fetch(
      `${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${nextAuthUserId}&limit=1`,
      { headers, signal: AbortSignal.timeout(10000) }
    );
    const existingRows = await existingRes.json();
    const existing = Array.isArray(existingRows) ? existingRows[0] : null;

    const preferredSource = isExplicitUpdate
      ? (bodyData.display_name ?? `${bodyData.first_name || ''} ${bodyData.last_name || ''}`)
      : (user.display_name || user.full_name || '');
    const { firstName, lastName } = splitDisplayName(preferredSource);
    const now = new Date().toISOString();

    if (existing) {
      const shouldUpdateName = isExplicitUpdate || (!existing.first_name && firstName);
      let activeProfile = existing;

      if (shouldUpdateName) {
        const updateRes = await fetch(
          `${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${nextAuthUserId}`,
          {
            method: 'PATCH',
            headers: { ...headers, Prefer: 'return=representation' },
            body: JSON.stringify({ first_name: firstName, last_name: lastName, updated_at: now }),
            signal: AbortSignal.timeout(10000),
          }
        );
        const updatedRows = await updateRes.json();
        if (Array.isArray(updatedRows) && updatedRows[0]) {
          activeProfile = updatedRows[0];
        }
      }

      if (activeProfile?.id) {
        const walletCheck = await fetch(
          `${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${activeProfile.id}&select=id&limit=1`,
          { headers, signal: AbortSignal.timeout(10000) }
        );
        const wallets = await walletCheck.json();
        if (!wallets?.length) {
          await fetch(`${supabaseUrl}/rest/v1/user_wallet`, {
            method: 'POST',
            headers: { ...headers, Prefer: 'return=minimal' },
            body: JSON.stringify({ user_profile_id: activeProfile.id, balance: 0 }),
            signal: AbortSignal.timeout(10000),
          });
        }
      }

      return Response.json({ profile: activeProfile, action: shouldUpdateName ? 'updated' : 'unchanged' });
    }

    const insertRes = await fetch(
      `${supabaseUrl}/rest/v1/user_profiles`,
      {
        method: 'POST',
        headers: { ...headers, Prefer: 'return=representation' },
        body: JSON.stringify({
          user_id: nextAuthUserId,
          first_name: firstName,
          last_name: lastName,
          created_at: now,
          updated_at: now,
        }),
        signal: AbortSignal.timeout(10000),
      }
    );
    const insertResult = await insertRes.json();

    if (!insertRes.ok) {
      return Response.json({ error: insertResult }, { status: insertRes.status });
    }

    const newProfile = insertResult[0];
    if (newProfile?.id) {
      await fetch(`${supabaseUrl}/rest/v1/user_wallet`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ user_profile_id: newProfile.id, balance: 0 }),
        signal: AbortSignal.timeout(10000),
      });
    }

    return Response.json({ profile: newProfile, action: 'created' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}