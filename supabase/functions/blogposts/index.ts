import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key',
};

interface BlogPost {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  published_at?: string;
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
    const postId = pathParts[pathParts.length - 1];

    const authHeader = req.headers.get('Authorization');
    const apiKey = req.headers.get('X-API-Key');

    let user = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
      if (!error && authUser) {
        user = authUser;
      }
    }

    // GET - List all published posts or get specific post
    if (req.method === 'GET') {
      if (postId && postId !== 'blogposts') {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*, profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)')
          .eq('id', postId)
          .single();

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

      const status = url.searchParams.get('status') || 'published';
      const tag = url.searchParams.get('tag');
      const search = url.searchParams.get('search');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let query = supabase
        .from('blog_posts')
        .select('*, profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)', { count: 'exact' });

      if (!user || status === 'published') {
        query = query.eq('status', 'published');
      } else if (status !== 'all') {
        query = query.eq('status', status);
      }

      if (tag) {
        query = query.contains('tags', [tag]);
      }

      if (search) {
        query = query.textSearch('title', search, { type: 'websearch' });
      }

      query = query.order('published_at', { ascending: false, nullsFirst: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ posts: data, total: count }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Require authentication for write operations
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Create new blog post
    if (req.method === 'POST') {
      const body: BlogPost = await req.json();

      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          title: body.title,
          slug: body.slug,
          content: body.content,
          excerpt: body.excerpt || '',
          cover_image: body.cover_image,
          tags: body.tags || [],
          author_id: user.id,
          status: body.status || 'draft',
          published_at: body.status === 'published' ? (body.published_at || new Date().toISOString()) : null,
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

    // PATCH - Update blog post
    if (req.method === 'PATCH' && postId && postId !== 'blogposts') {
      const body: Partial<BlogPost> = await req.json();

      const updateData: any = {};
      if (body.title) updateData.title = body.title;
      if (body.slug) updateData.slug = body.slug;
      if (body.content) updateData.content = body.content;
      if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
      if (body.cover_image !== undefined) updateData.cover_image = body.cover_image;
      if (body.tags !== undefined) updateData.tags = body.tags;
      if (body.status !== undefined) {
        updateData.status = body.status;
        if (body.status === 'published' && !body.published_at) {
          updateData.published_at = new Date().toISOString();
        } else if (body.published_at) {
          updateData.published_at = body.published_at;
        }
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId)
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

    // DELETE - Delete blog post
    if (req.method === 'DELETE' && postId && postId !== 'blogposts') {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

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