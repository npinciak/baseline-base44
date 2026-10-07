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
    const createUserRes = await base44.asServiceRole.integrations.custom.call('mx', 'post:/users', {
      payload: { user: { id: mxUserId } },
      headers,
    });
    if (createUserRes.success) {
      userGuid = createUserRes.data?.user?.guid;
    } else {
      const readRes = await base44.asServiceRole.integrations.custom.call('mx', 'get:/users/{user_identifier}', {
        pathParams: { user_identifier: mxUserId },
        headers,
      });
      userGuid = readRes.data?.user?.guid;
      if (!userGuid) {
        return Response.json({ error: 'Failed to create MX user', details: createUserRes.data }, { status: 500 });
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