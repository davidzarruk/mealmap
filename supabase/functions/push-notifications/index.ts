/**
 * F9-008: Push Notifications Edge Function (Template)
 *
 * Supabase Edge Function that sends push notifications to users.
 * Triggered by a cron job or webhook.
 *
 * Deploy with: supabase functions deploy push-notifications
 *
 * Environment variables needed:
 *   - EXPO_PUSH_TOKEN_URL (default: https://exp.host/--/api/v2/push/send)
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

// @ts-ignore — Deno imports for Supabase Edge Functions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushNotificationPayload {
  type: 'meal_reminder' | 'plan_expiring' | 'weekly_summary';
  userId?: string; // If set, only send to this user
}

interface UserPushToken {
  user_id: string;
  push_token: string;
  enabled: boolean;
}

serve(async (req: Request) => {
  try {
    const payload: PushNotificationPayload = await req.json();

    // @ts-ignore — Deno env
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    // @ts-ignore
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get push tokens
    let query = supabase
      .from('user_push_tokens')
      .select('user_id, push_token, enabled')
      .eq('enabled', true);

    if (payload.userId) {
      query = query.eq('user_id', payload.userId);
    }

    const { data: tokens, error } = await query;
    if (error) throw error;

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'No tokens found' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build notification messages
    const messages = (tokens as UserPushToken[]).map((t) => ({
      to: t.push_token,
      sound: 'default',
      ...getNotificationContent(payload.type),
    }));

    // Send via Expo Push API
    const pushResponse = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });

    const result = await pushResponse.json();

    return new Response(
      JSON.stringify({ sent: messages.length, result }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});

function getNotificationContent(type: PushNotificationPayload['type']): {
  title: string;
  body: string;
  data?: Record<string, string>;
} {
  switch (type) {
    case 'meal_reminder':
      return {
        title: '🍽️ Time to plan your meals!',
        body: "Don't forget to check today's meal plan.",
        data: { screen: 'Plan' },
      };
    case 'plan_expiring':
      return {
        title: '📅 Your weekly plan is expiring',
        body: 'Start a new plan for next week to stay on track.',
        data: { screen: 'Plan' },
      };
    case 'weekly_summary':
      return {
        title: '📊 Weekly Summary Ready',
        body: 'Check how your meal planning went this week!',
        data: { screen: 'Analytics' },
      };
    default:
      return {
        title: '🍽️ Mealmap',
        body: 'You have a new notification.',
      };
  }
}
