import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

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
      // Create a new MX user
      const createUserRes = await base44.asServiceRole.integrations.custom.call('mx', 'post:/users', {
        payload: { user: { id: user.id } },
        headers,
      });
      if (!createUserRes.success && createUserRes.status_code !== 409) {
        return Response.json({ error: 'Failed to create MX user', details: createUserRes.data }, { status: 500 });
      }
      if (createUserRes.status_code === 409) {
        const readRes = await base44.asServiceRole.integrations.custom.call('mx', 'get:/users/{user_identifier}', {
          pathParams: { user_identifier: user.id },
          headers,
        });
        userGuid = readRes.data?.user?.guid;
      } else {
        userGuid = createUserRes.data?.user?.guid;
      }

      // Save BankConnection with user GUID
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