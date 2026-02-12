import { createClient } from 'npm:@supabase/supabase-js@2.74.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: pendingRequests, error: fetchError } = await supabase
      .from('admin_requests')
      .select(`
        id,
        group_id,
        user_id,
        created_at
      `)
      .eq('status', 'pending')
      .lt('created_at', twentyFourHoursAgo);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${pendingRequests?.length || 0} pending requests older than 24 hours`);

    const results = {
      approved: [],
      rejected: [],
      errors: []
    };

    for (const request of pendingRequests || []) {
      try {
        const { data: objections, error: objError } = await supabase
          .from('admin_request_objections')
          .select('id, user_id')
          .eq('request_id', request.id);

        if (objError) {
          throw objError;
        }

        const uniqueObjectors = new Set(objections?.map(o => o.user_id) || []);
        const objectionCount = uniqueObjectors.size;

        console.log(`Request ${request.id}: ${objectionCount} unique objections`);

        if (objectionCount >= 2) {
          const { error: rejectError } = await supabase
            .from('admin_requests')
            .update({
              status: 'rejected',
              resolved_at: new Date().toISOString()
            })
            .eq('id', request.id);

          if (rejectError) throw rejectError;

          results.rejected.push(request.id);
          console.log(`Request ${request.id} rejected due to ${objectionCount} objections`);
        } else {
          const { error: updateError } = await supabase
            .from('admin_requests')
            .update({
              status: 'approved',
              resolved_at: new Date().toISOString()
            })
            .eq('id', request.id);

          if (updateError) throw updateError;

          const { error: memberError } = await supabase
            .from('group_members')
            .update({ role: 'admin' })
            .eq('group_id', request.group_id)
            .eq('profile_id', request.user_id);

          if (memberError) throw memberError;

          results.approved.push(request.id);
          console.log(`Request ${request.id} approved, user granted admin role`);
        }

      } catch (error) {
        console.error(`Error processing request ${request.id}:`, error);
        results.errors.push({ request_id: request.id, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: pendingRequests?.length || 0,
        results
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error in process-admin-requests:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});