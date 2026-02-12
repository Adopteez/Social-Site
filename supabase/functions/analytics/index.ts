import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key, X-Session-ID',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);

    // POST /analytics - Track event
    if (req.method === 'POST') {
      const { event_type, event_data, user_id } = await req.json();
      const sessionId = req.headers.get('X-Session-ID') || crypto.randomUUID();

      if (!event_type) {
        return new Response(JSON.stringify({ error: 'event_type is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('analytics_events')
        .insert({
          event_type,
          event_data: event_data || {},
          user_id,
          session_id: sessionId,
        })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /analytics - Get analytics data (super admin only)
    if (req.method === 'GET') {
      // Check authentication
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if user is super admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'super_admin') {
        return new Response(JSON.stringify({ error: 'Forbidden: Super admin access required' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const eventType = url.searchParams.get('event_type');
      const startDate = url.searchParams.get('start_date');
      const endDate = url.searchParams.get('end_date');
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const aggregateBy = url.searchParams.get('aggregate_by'); // day, hour, event_type

      // If aggregation is requested
      if (aggregateBy) {
        let query = '';
        
        if (aggregateBy === 'event_type') {
          query = `
            SELECT 
              event_type,
              COUNT(*) as count,
              COUNT(DISTINCT user_id) as unique_users,
              COUNT(DISTINCT session_id) as unique_sessions
            FROM analytics_events
            WHERE 1=1
          `;
          
          if (startDate) query += ` AND created_at >= '${startDate}'`;
          if (endDate) query += ` AND created_at <= '${endDate}'`;
          
          query += ` GROUP BY event_type ORDER BY count DESC`;
        } else if (aggregateBy === 'day') {
          query = `
            SELECT 
              DATE(created_at) as date,
              COUNT(*) as count,
              COUNT(DISTINCT user_id) as unique_users,
              COUNT(DISTINCT session_id) as unique_sessions
            FROM analytics_events
            WHERE 1=1
          `;
          
          if (eventType) query += ` AND event_type = '${eventType}'`;
          if (startDate) query += ` AND created_at >= '${startDate}'`;
          if (endDate) query += ` AND created_at <= '${endDate}'`;
          
          query += ` GROUP BY DATE(created_at) ORDER BY date DESC`;
        }

        const { data, error } = await supabase.rpc('execute_sql', { query });

        if (error) {
          // If RPC doesn't exist, fall back to regular query
          let fallbackQuery = supabase
            .from('analytics_events')
            .select('event_type, created_at', { count: 'exact' });

          if (eventType) fallbackQuery = fallbackQuery.eq('event_type', eventType);
          if (startDate) fallbackQuery = fallbackQuery.gte('created_at', startDate);
          if (endDate) fallbackQuery = fallbackQuery.lte('created_at', endDate);

          const { data: fallbackData, error: fallbackError, count } = await fallbackQuery
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (fallbackError) {
            return new Response(JSON.stringify({ error: fallbackError.message }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify({ events: fallbackData, total: count }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ analytics: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Regular event listing
      let query = supabase
        .from('analytics_events')
        .select('*', { count: 'exact' });

      if (eventType) query = query.eq('event_type', eventType);
      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      query = query.order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ events: data, total: count }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});