import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key, X-Session-ID',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
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
    const endpoint = pathParts[pathParts.length - 1];

    // Get user if authenticated
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    // Get or create session ID
    let sessionId = req.headers.get('X-Session-ID');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    // POST /chat - Send message to chat agent
    if (req.method === 'POST' && (endpoint === 'chat' || !endpoint)) {
      const { message, conversation_id } = await req.json();

      if (!message) {
        return new Response(JSON.stringify({ error: 'Message is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get or create conversation
      let conversationId = conversation_id;
      if (!conversationId) {
        const { data: newConversation, error: convError } = await supabase
          .from('chat_conversations')
          .insert({
            user_id: userId,
            session_id: sessionId,
          })
          .select()
          .single();

        if (convError) {
          return new Response(JSON.stringify({ error: convError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        conversationId = newConversation.id;
      }

      // Save user message
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
      });

      // Get conversation history for context
      const { data: history } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(10);

      // Here you would integrate with your AI service (OpenAI, Claude, etc.)
      // For now, we'll return a simple response
      const aiResponse = `Tak for din besked! Dette er en placeholder-besked fra chatagenten. I en produktionsklar version ville denne være forbundet til en AI-service som OpenAI eller Anthropic Claude.\n\nDu skrev: "${message}"`;

      // Save AI response
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
      });

      // Track analytics
      await supabase.from('analytics_events').insert({
        event_type: 'chat_interaction',
        event_data: { conversation_id: conversationId, message_length: message.length },
        user_id: userId,
        session_id: sessionId,
      });

      return new Response(JSON.stringify({ 
        conversation_id: conversationId,
        response: aiResponse,
        session_id: sessionId 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /chat/history - Get chat history
    if (req.method === 'GET' && endpoint === 'history') {
      const conversationId = url.searchParams.get('conversation_id');

      if (!conversationId) {
        return new Response(JSON.stringify({ error: 'conversation_id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ messages }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /chat/conversations - Get user's conversations
    if (req.method === 'GET' && endpoint === 'conversations') {
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: conversations, error } = await supabase
        .from('chat_conversations')
        .select('*, chat_messages(content, created_at)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ conversations }), {
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