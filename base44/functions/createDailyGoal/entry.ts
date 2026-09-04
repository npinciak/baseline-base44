import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const GOAL_ROTATION = [
  { name: "[Auto] Emergency Fund", goal_type: "emergency", target_amount: 5000, image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400" },
  { name: "[Auto] Dream Vacation", goal_type: "vacation", target_amount: 3500, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
  { name: "[Auto] New Laptop", goal_type: "tech", target_amount: 1800, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400" },
  { name: "[Auto] Investment Starter", goal_type: "investment", target_amount: 10000, image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400" },
  { name: "[Auto] Down Payment Fund", goal_type: "buyHome", target_amount: 25000, image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400" },
  { name: "[Auto] New Car Savings", goal_type: "newCar", target_amount: 8000, image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400" },
  { name: "[Auto] Wedding Fund", goal_type: "other", target_amount: 15000, image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400" },
  { name: "[Auto] Side Business Startup", goal_type: "investment", target_amount: 4000, image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400" },
  { name: "[Auto] College Fund", goal_type: "education", target_amount: 20000, image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400" },
  { name: "[Auto] Holiday Travel", goal_type: "vacation", target_amount: 2200, image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400" },
  { name: "[Auto] Home Renovation", goal_type: "buyHome", target_amount: 12000, image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400" },
  { name: "[Auto] Retirement Boost", goal_type: "retirement", target_amount: 50000, image: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=400" },
  { name: "[Auto] Fitness Equipment", goal_type: "other", target_amount: 900, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400" },
  { name: "[Auto] Rainy Day Reserve", goal_type: "emergency", target_amount: 3000, image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400" },
  { name: "[Auto] Music Studio Setup", goal_type: "other", target_amount: 2500, image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400" },
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const headers = {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };

    // 1. Look up nathanp@base44.com in next_auth.users
    const userRes = await fetch(
      `${supabaseUrl}/rest/v1/users?email=eq.pinciaknathand%40gmail.com&select=id&limit=1`,
      { headers: { ...headers, 'Accept-Profile': 'next_auth' } }
    );
    const users = await userRes.json();
    if (!Array.isArray(users) || users.length === 0) {
      return Response.json({ error: 'Target user not found' }, { status: 404 });
    }
    const nextAuthUserId = users[0].id;

    // 2. Resolve user_profile_id
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${nextAuthUserId}&select=id&limit=1`,
      { headers }
    );
    const profiles = await profileRes.json();
    if (!Array.isArray(profiles) || profiles.length === 0) {
      return Response.json({ error: 'User profile not found' }, { status: 404 });
    }
    const userProfileId = profiles[0].id;

    // 3. Check existing goals count; if >= 10, delete the 5 oldest
    const existingRes = await fetch(
      `${supabaseUrl}/rest/v1/goals?user_profile_id=eq.${userProfileId}&select=id,created_at&order=created_at.asc`,
      { headers }
    );
    const existingGoals = await existingRes.json();
    if (Array.isArray(existingGoals) && existingGoals.length >= 10) {
      const toDelete = existingGoals.slice(0, 5).map(g => g.id);
      await fetch(
        `${supabaseUrl}/rest/v1/goals?id=in.(${toDelete.join(',')})`,
        { method: 'DELETE', headers }
      );
    }

    // 4. Pick today's goal from the rotation using day-of-year index
    const now = new Date();
    const startOfYear = new Date(now.getUTCFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - startOfYear) / 86400000);
    const pick = GOAL_ROTATION[dayOfYear % GOAL_ROTATION.length];

    // 5. Build target date 12 months from today
    const targetDate = new Date(now);
    targetDate.setFullYear(targetDate.getFullYear() + 1);

    const payload = {
      name: pick.name,
      goal_type: pick.goal_type,
      image: pick.image,
      target_amount: pick.target_amount,
      current_amount: 0,
      target_date: targetDate.toISOString().slice(0, 10),
      currency_code: 'USD',
      user_profile_id: userProfileId,
    };

    // 6. Insert into Supabase goals table
    const goalRes = await fetch(`${supabaseUrl}/rest/v1/goals`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const result = await goalRes.json();

    if (!goalRes.ok) {
      return Response.json({ error: result }, { status: goalRes.status });
    }

    return Response.json({
      success: true,
      goal: result[0],
      rotation_index: dayOfYear % GOAL_ROTATION.length,
      day_of_year: dayOfYear,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}