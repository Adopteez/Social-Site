import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key',
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
    const pathParts = url.pathname.split('/').filter(p => p);
    const action = pathParts[pathParts.length - 1];

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

    // Check if user is super admin for certain operations
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isSuperAdmin = profile?.role === 'super_admin';

    // POST /moderation/report - Report content
    if (req.method === 'POST' && action === 'report') {
      const { content_type, content_id, reason, description } = await req.json();

      if (!content_type || !content_id || !reason) {
        return new Response(JSON.stringify({ error: 'content_type, content_id, and reason are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('content_reports')
        .insert({
          reporter_id: user.id,
          content_type,
          content_id,
          reason,
          description: description || '',
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

    // GET /moderation/reports - Get reports (super admin only)
    if (req.method === 'GET' && action === 'reports') {
      if (!isSuperAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden: Super admin access required' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const status = url.searchParams.get('status') || 'pending';
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let query = supabase
        .from('content_reports')
        .select('*, profiles!content_reports_reporter_id_fkey(id, full_name, avatar_url)', { count: 'exact' });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      query = query.order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ reports: data, total: count }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATCH /moderation/reports/{id} - Update report status (super admin only)
    if (req.method === 'PATCH' && action !== 'report' && action !== 'reports' && action !== 'moderation') {
      if (!isSuperAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden: Super admin access required' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const reportId = action;
      const { status, reviewed_at } = await req.json();

      const { data, error } = await supabase
        .from('content_reports')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: reviewed_at || new Date().toISOString(),
        })
        .eq('id', reportId)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /moderation/content/{id} - Delete content (super admin only)
    if (req.method === 'DELETE' && action === 'content') {
      if (!isSuperAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden: Super admin access required' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { content_type, content_id } = await req.json();

      if (!content_type || !content_id) {
        return new Response(JSON.stringify({ error: 'content_type and content_id are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Map content type to table name
      const tableMap: Record<string, string> = {
        'blog_post': 'blog_posts',
        'discussion': 'discussions',
        'message': 'messages',
        'comment': 'discussion_comments',
      };

      const tableName = tableMap[content_type];
      if (!tableName) {
        return new Response(JSON.stringify({ error: 'Invalid content_type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', content_id);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
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