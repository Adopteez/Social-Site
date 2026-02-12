import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Tag, ArrowLeft, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      setPost(data);

      if (data?.tags && data.tags.length > 0) {
        const { data: related } = await supabase
          .from('blog_posts')
          .select('id, title, slug, cover_image, published_at')
          .eq('status', 'published')
          .neq('id', data.id)
          .overlaps('tags', data.tags)
          .order('published_at', { ascending: false })
          .limit(3);

        setRelatedPosts(related || []);
      }

      await supabase
        .from('analytics_events')
        .insert({
          event_type: 'blog_read',
          event_data: { post_id: data.id, slug: slug },
          session_id: crypto.randomUUID(),
        });
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sharePost = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopieret til udklipsholder!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Indlæg ikke fundet</h1>
          <Link to="/blog" className="text-blue-500 hover:underline">
            Tilbage til blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={20} />
            Tilbage til blog
          </Link>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{formatDate(post.published_at)}</span>
            </div>
            {post.profiles && (
              <div className="flex items-center gap-2">
                {post.profiles.avatar_url && (
                  <img
                    src={post.profiles.avatar_url}
                    alt={post.profiles.full_name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <User size={16} />
                <span>{post.profiles.full_name}</span>
              </div>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full"
                >
                  <Tag size={14} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={sharePost}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Share2 size={18} />
            Del artikel
          </button>
        </div>
      </div>

      {post.cover_image && (
        <div className="max-w-5xl mx-auto px-6 -mt-8">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full rounded-2xl shadow-xl"
          />
        </div>
      )}

      <article className="max-w-4xl mx-auto px-6 py-12">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {relatedPosts.length > 0 && (
        <div className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Relaterede artikler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  {relatedPost.cover_image && (
                    <div className="aspect-video overflow-hidden rounded-lg mb-3">
                      <img
                        src={relatedPost.cover_image}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-500 transition-colors">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(relatedPost.published_at)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Adopteez.com. Alle rettigheder forbeholdes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
