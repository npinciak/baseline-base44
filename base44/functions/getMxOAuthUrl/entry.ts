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
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseHeaders = { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` };

    // Resolve canonical next_auth UUID (consistent with profile/goals resolution)
    let nextAuthUserId = isUuid(user.id) ? user.id : null;
    if (!nextAuthUserId && user.email) {
      const lookupRes = await fetch(
        `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(user.email)}&select=id&limit=1`,
        { headers: { ...supabaseHeaders, 'Accept-Profile': 'next_auth' } }
      );
      const rows = await lookupRes.json();
      nextAuthUserId = rows?.[0]?.id ?? null;
    }

    // Use next_auth UUID if available, otherwise fall back to base44 user.id
    const mxUserId = nextAuthUserId || user.id;

    const apiKey = Deno.env.get('MX_API');
    const clientId = Deno.env.get('MX_CLIENT');
    const apiVersion = Deno.env.get('MX_API_VERSION') || 'v20250224';
    const authHeader = `Basic ${btoa(`${clientId}:${apiKey}`)}`;

    const headers = {
      'Authorization': authHeader,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Accept-Version': apiVersion,
    };

    // Step 1: Create or retrieve MX user
    let userGuid = null;
    const existingConn = await base44.asServiceRole.entities.BankConnection.filter({ user_id: user.id, provider: 'mx' });
    if (existingConn.length > 0 && existingConn[0].access_token_ref) {
      userGuid = existingConn[0].access_token_ref;
    } else {
      // Create a new MX user using the canonical UUID
      const createUserRes = await base44.asServiceRole.integrations.custom.call('mx', 'post:/users', {
        payload: { user: { id: mxUserId } },
        headers,
      });
      if (!createUserRes.success && createUserRes.status_code !== 409) {
        return Response.json({ error: 'Failed to create MX user', details: createUserRes.data }, { status: 500 });
      }
      if (createUserRes.status_code === 409) {
        const readRes = await base44.asServiceRole.integrations.custom.call('mx', 'get:/users/{user_identifier}', {
          pathParams: { user_identifier: mxUserId },
          headers,
        });
        userGuid = readRes.data?.user?.guid;
      } else {
        userGuid = createUserRes.data?.user?.guid;
      }

      // Save BankConnection with MX user GUID
      if (existingConn.length > 0) {
        await base44.asServiceRole.entities.BankConnection.update(existingConn[0].id, { access_token_ref: userGuid });
      } else {
        await base44.asServiceRole.entities.BankConnection.create({
          user_id: user.id,
          provider: 'mx',
          institution_name: 'MX',
          access_token_ref: userGuid,
          is_active: false,
        });
      }
    }

    // Step 2: Request widget URL
    const widgetRes = await base44.asServiceRole.integrations.custom.call('mx', 'post:/users/{user_identifier}/widget_urls', {
      pathParams: { user_identifier: userGuid },
      payload: {
        widget_url: {
          widget_type: 'connect_widget',
          is_mobile_webview: false,
          ui_message_version: 4,
          color_scheme: 'dark',
        },
      },
      headers,
    });

    if (!widgetRes.success) {
      return Response.json({ error: 'Failed to get widget URL', details: widgetRes.data }, { status: 500 });
    }

    return Response.json({
      widget_url: widgetRes.data?.widget_url?.url,
      userGuid,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});