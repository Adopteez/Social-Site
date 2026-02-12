import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key',
};

interface SEOData {
  page_path: string;
  title?: string;
  meta_description?: string;
  keywords?: string[];
  canonical_url?: string;
  og_image?: string;
  og_title?: string;
  og_description?: string;
}

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
    const pageId = pathParts[pathParts.length - 1];

    // GET - Get SEO data for a page
    if (req.method === 'GET') {
      const pagePath = url.searchParams.get('path');
      
      if (!pagePath && (!pageId || pageId === 'seo')) {
        // Get all SEO data
        const { data, error } = await supabase
          .from('page_seo')
          .select('*')
          .order('page_path');

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ pages: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const query = pagePath 
        ? supabase.from('page_seo').select('*').eq('page_path', pagePath).single()
        : supabase.from('page_seo').select('*').eq('id', pageId).single();

      const { data, error } = await query;

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check authentication for write operations
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

    // POST - Create new SEO data
    if (req.method === 'POST') {
      const body: SEOData = await req.json();

      const { data, error } = await supabase
        .from('page_seo')
        .insert({
          page_path: body.page_path,
          title: body.title,
          meta_description: body.meta_description,
          keywords: body.keywords || [],
          canonical_url: body.canonical_url,
          og_image: body.og_image,
          og_title: body.og_title,
          og_description: body.og_description,
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

    // PATCH - Update SEO data
    if (req.method === 'PATCH' && pageId && pageId !== 'seo') {
      const body: Partial<SEOData> = await req.json();

      const updateData: any = {};
      if (body.title !== undefined) updateData.title = body.title;
      if (body.meta_description !== undefined) updateData.meta_description = body.meta_description;
      if (body.keywords !== undefined) updateData.keywords = body.keywords;
      if (body.canonical_url !== undefined) updateData.canonical_url = body.canonical_url;
      if (body.og_image !== undefined) updateData.og_image = body.og_image;
      if (body.og_title !== undefined) updateData.og_title = body.og_title;
      if (body.og_description !== undefined) updateData.og_description = body.og_description;

      const { data, error } = await supabase
        .from('page_seo')
        .update(updateData)
        .eq('id', pageId)
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

    // DELETE - Delete SEO data
    if (req.method === 'DELETE' && pageId && pageId !== 'seo') {
      const { error } = await supabase
        .from('page_seo')
        .delete()
        .eq('id', pageId);

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