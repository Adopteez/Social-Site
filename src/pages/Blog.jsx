import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, Tag, ArrowRight, Menu, X, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const loginDropdownRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target)) {
        setShowLoginDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedTag]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('blog_posts')
        .select('*, profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (selectedTag) {
        query = query.contains('tags', [selectedTag]);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPosts(data || []);

      const tags = new Set();
      data?.forEach(post => {
        post.tags?.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags));
    } catch (error) {
      console.error('Error fetching posts:', error);
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

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{
        backgroundImage: 'url(https://images.pexels.com/photos/1116302/pexels-photo-1116302.jpeg?auto=compress&cs=tinysrgb&w=1920)',
      }}
    >
      <div className="absolute inset-0 bg-[#1A237E]/40 backdrop-blur-[2px]"></div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/30 to-transparent backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center h-28">
            <div className="hidden lg:flex items-center" style={{ gap: '10px' }}>
              <Link to="/" className="text-white hover:text-[#FF6F00] font-bold text-4xl transition-colors drop-shadow-lg">
                Hjem
              </Link>
              <Link to="/groups" className="text-white hover:text-[#FF6F00] font-bold text-4xl transition-colors drop-shadow-lg">
                Grupper
              </Link>
              <Link to="/blog" className="text-white hover:text-[#FF6F00] font-bold text-4xl transition-colors drop-shadow-lg">
                Blog
              </Link>
              <Link to="/pricing" className="text-white hover:text-[#FF6F00] font-bold text-4xl transition-colors drop-shadow-lg">
                Priser
              </Link>
              <Link to="/about" className="text-white hover:text-[#FF6F00] font-bold text-4xl transition-colors drop-shadow-lg">
                Om os
              </Link>
              <Link to="/contact" className="text-white hover:text-[#FF6F00] font-bold text-4xl transition-colors drop-shadow-lg">
                Kontakt
              </Link>
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden text-white p-2"
            >
              {showMobileMenu ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>

          {showMobileMenu && (
            <div className="lg:hidden bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl mb-4 py-4">
              <Link to="/" className="block px-6 py-3 text-gray-700 hover:bg-[#FF6F00]/10 hover:text-[#FF6F00] font-bold transition-colors">
                Hjem
              </Link>
              <Link to="/groups" className="block px-6 py-3 text-gray-700 hover:bg-[#FF6F00]/10 hover:text-[#FF6F00] font-bold transition-colors">
                Grupper
              </Link>
              <Link to="/blog" className="block px-6 py-3 text-[#FF6F00] bg-[#FF6F00]/10 font-bold transition-colors">
                Blog
              </Link>
              <Link to="/pricing" className="block px-6 py-3 text-gray-700 hover:bg-[#FF6F00]/10 hover:text-[#FF6F00] font-bold transition-colors">
                Priser
              </Link>
              <Link to="/about" className="block px-6 py-3 text-gray-700 hover:bg-[#FF6F00]/10 hover:text-[#FF6F00] font-bold transition-colors">
                Om os
              </Link>
              <Link to="/contact" className="block px-6 py-3 text-gray-700 hover:bg-[#FF6F00]/10 hover:text-[#FF6F00] font-bold transition-colors">
                Kontakt
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div className="relative z-10 pt-32">
        <div className="max-w-7xl mx-auto px-6 pt-64 pb-12">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            Adopteez Blog
          </h1>
          <p className="text-2xl text-white drop-shadow-xl mb-12">
            Historier, guides og nyheder fra adoptionsfællesskabet
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-20">
        {allTags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-6 py-3 rounded-full text-sm font-bold transition-all backdrop-blur-md shadow-lg ${
                !selectedTag
                  ? 'bg-[#FF6F00] text-white shadow-[#FF6F00]/50'
                  : 'bg-white/90 text-gray-800 hover:bg-white hover:shadow-xl'
              }`}
            >
              Alle
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-6 py-3 rounded-full text-sm font-bold transition-all backdrop-blur-md shadow-lg ${
                  selectedTag === tag
                    ? 'bg-[#FF6F00] text-white shadow-[#FF6F00]/50'
                    : 'bg-white/90 text-gray-800 hover:bg-white hover:shadow-xl'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-12">
            <p className="text-gray-800 text-xl font-semibold">Ingen blogindlæg fundet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-[#FF6F00]/30 hover:scale-105 transition-all duration-300 overflow-hidden group border border-white/50"
              >
                {post.cover_image ? (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="aspect-video overflow-hidden bg-gradient-to-br from-[#1A237E] to-[#FF6F00] flex items-center justify-center">
                    <div className="text-white text-7xl font-bold opacity-30">A</div>
                  </div>
                )}
                <div className="p-8">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={16} className="text-[#FF6F00]" />
                      <span className="font-medium">{formatDate(post.published_at)}</span>
                    </div>
                    {post.profiles && (
                      <div className="flex items-center gap-1.5">
                        <User size={16} className="text-[#FF6F00]" />
                        <span className="font-medium">{post.profiles.full_name}</span>
                      </div>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#FF6F00] transition-colors leading-tight">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="text-gray-700 mb-5 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#1A237E] to-[#1A237E]/80 text-white text-xs font-bold rounded-full shadow-md"
                        >
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center text-[#FF6F00] font-bold text-lg group-hover:gap-2 transition-all">
                    Læs mere
                    <ArrowRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        </div>
      </div>

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
