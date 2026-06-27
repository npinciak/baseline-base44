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

    const body = await req.json();
    const { institutionCode, redirectUri } = body;

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
      // If 409 (already exists), fetch the user
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
          institution_name: institutionCode || 'MX',
          access_token_ref: userGuid,
          is_active: false,
        });
      }
    }

    // Step 2: Create a member for the institution
    const memberRes = await base44.asServiceRole.integrations.custom.call('mx', 'post:/users/{user_identifier}/members', {
      pathParams: { user_identifier: userGuid },
      payload: {
        member: {
          institution_code: institutionCode,
          is_oauth: true,
        },
      },
      headers,
    });

    if (!memberRes.success) {
      return Response.json({ error: 'Failed to create MX member', details: memberRes.data }, { status: 500 });
    }

    const memberGuid = memberRes.data?.member?.guid;

    // Step 3: Get OAuth window URI
    const oauthRes = await base44.asServiceRole.integrations.custom.call(
      'mx',
      'get:/users/{user_identifier}/members/{member_identifier}/oauth_window_uri',
      {
        pathParams: { user_identifier: userGuid, member_identifier: memberGuid },
        queryParams: { redirect_uri: redirectUri || '' },
        headers,
      }
    );

    if (!oauthRes.success) {
      return Response.json({ error: 'Failed to get OAuth URI', details: oauthRes.data }, { status: 500 });
    }

    return Response.json({
      oauth_window_uri: oauthRes.data?.member?.oauth_window_uri,
      userGuid,
      memberGuid,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});