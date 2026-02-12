import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Heart, MessageCircle, Share2, Home as HomeIcon, Users, Calendar, Mail, Send, MapPin, DollarSign, Image } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import CalendarWidget from '../components/CalendarWidget';
import BirthdayWidget from '../components/BirthdayWidget';
import ChatManager from '../components/ChatManager';
import FeedbackWidget from '../components/FeedbackWidget';

export default function Home() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newPostVideo, setNewPostVideo] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [uploadingPostImage, setUploadingPostImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [partnerGroups, setPartnerGroups] = useState([]);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [activeView, setActiveView] = useState('feed');
  const [events, setEvents] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [postComments, setPostComments] = useState({});
  const chatManagerRef = useRef();

  useEffect(() => {
    fetchPosts();
    fetchDiscussions();
    fetchPartnerGroups();
    fetchSuggestedFriends();
    fetchUnreadMessages();
    fetchEvents();
    fetchUserGroups();
  }, []);

  useEffect(() => {
    const combined = [
      ...posts.map(p => ({ ...p, type: 'post' })),
      ...discussions.map(d => ({ ...d, type: 'discussion' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setFeedItems(combined);
  }, [posts, discussions]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, full_name, avatar_url),
          post_likes(id, profile_id),
          post_comments(id)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    try {
      const { data: memberGroups, error: groupError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('profile_id', user.id);

      if (groupError) throw groupError;

      const groupIds = memberGroups?.map(m => m.group_id) || [];

      if (groupIds.length === 0) {
        setDiscussions([]);
        return;
      }

      const { data, error } = await supabase
        .from('group_discussions')
        .select(`
          *,
          author:profiles!profile_id(id, full_name, avatar_url),
          group:groups(id, name),
          discussion_replies(id)
        `)
        .in('group_id', groupIds)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setDiscussions(data || []);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    }
  };

  const fetchPartnerGroups = async () => {
    try {
      const { data: groups, error } = await supabase
        .from('groups')
        .select(`
          *,
          partner_organization:partner_organizations(name, logo_url),
          member_count:group_members(count)
        `)
        .eq('is_partner_group', true)
        .limit(5);

      if (error) throw error;

      const groupsWithMemberCheck = await Promise.all(
        (groups || []).map(async (group) => {
          const { data: membership } = await supabase
            .from('group_members')
            .select('id')
            .eq('group_id', group.id)
            .eq('profile_id', user.id)
            .maybeSingle();

          return {
            ...group,
            isMember: !!membership
          };
        })
      );

      setPartnerGroups(groupsWithMemberCheck.filter(g => !g.isMember));
    } catch (error) {
      console.error('Error fetching partner groups:', error);
    }
  };

  const handleJoinPartnerGroup = (group) => {
    if (group.requires_verification) {
      setSelectedGroup(group);
      setShowVerificationModal(true);
      setVerificationCode('');
      setVerificationError('');
    } else {
      joinGroup(group.id);
    }
  };

  const handleVerifyAndJoin = async () => {
    if (!verificationCode.trim()) {
      setVerificationError('Indtast venligst en verifikationskode');
      return;
    }

    try {
      const { data: codeData, error: codeError } = await supabase
        .from('group_verification_codes')
        .select('*')
        .eq('group_id', selectedGroup.id)
        .eq('code', verificationCode.trim())
        .eq('is_used', false)
        .maybeSingle();

      if (codeError || !codeData) {
        setVerificationError('Ugyldig eller allerede brugt kode');
        return;
      }

      if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
        setVerificationError('Denne kode er udløbet');
        return;
      }

      const { error: updateError } = await supabase
        .from('group_verification_codes')
        .update({
          is_used: true,
          used_by: user.id,
          used_at: new Date().toISOString()
        })
        .eq('id', codeData.id);

      if (updateError) throw updateError;

      await joinGroup(selectedGroup.id);
      setShowVerificationModal(false);
      setSelectedGroup(null);
    } catch (error) {
      console.error('Error verifying code:', error);
      setVerificationError('Der opstod en fejl. Prøv igen.');
    }
  };

  const joinGroup = async (groupId) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          profile_id: user.id,
          role: 'member'
        });

      if (error) throw error;
      fetchPartnerGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const fetchSuggestedFriends = async () => {
    try {
      const { data: myGroups } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('profile_id', user.id);

      const myGroupIds = (myGroups || []).map(g => g.group_id);

      if (myGroupIds.length === 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, country')
          .neq('id', user.id)
          .eq('country', profile?.country || 'Denmark')
          .limit(5);

        setSuggestedFriends(profiles || []);
        return;
      }

      const { data: groupMembers } = await supabase
        .from('group_members')
        .select(`
          profile_id,
          profiles:profiles(id, full_name, avatar_url, country)
        `)
        .in('group_id', myGroupIds)
        .neq('profile_id', user.id);

      const { data: existingFriends } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', user.id);

      const friendIds = new Set((existingFriends || []).map(f => f.friend_id));

      const uniqueProfiles = new Map();
      (groupMembers || []).forEach(member => {
        if (member.profiles && !friendIds.has(member.profiles.id)) {
          uniqueProfiles.set(member.profiles.id, member.profiles);
        }
      });

      const suggested = Array.from(uniqueProfiles.values()).slice(0, 5);
      setSuggestedFriends(suggested);
    } catch (error) {
      console.error('Error fetching suggested friends:', error);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', user.id);

      if (participantError) throw participantError;

      const conversationIds = participantData?.map(p => p.conversation_id) || [];

      if (conversationIds.length === 0) {
        setUnreadMessageCount(0);
        return;
      }

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .neq('sender_id', user.id);

      if (error) throw error;
      setUnreadMessageCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data: memberGroups } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('profile_id', user.id);

      const groupIds = memberGroups?.map((gm) => gm.group_id) || [];

      if (groupIds.length === 0) {
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          group:groups(id, name),
          organizer:profiles!events_organizer_id_fkey(id, full_name),
          event_attendees(id, profile_id, status)
        `)
        .in('group_id', groupIds)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .insert([{ event_id: eventId, profile_id: user.id, status: 'registered' }]);

      if (error) throw error;
      fetchEvents();
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const { data: memberGroups, error } = await supabase
        .from('group_members')
        .select(`
          group:groups(
            id,
            name,
            description,
            banner_url,
            adoption_country,
            group_members(id)
          )
        `)
        .eq('profile_id', user.id);

      if (error) throw error;
      setUserGroups(memberGroups?.map(m => m.group) || []);
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
      /youtube-nocookie\.com\/embed\/([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return `https://www.youtube-nocookie.com/embed/${match[1]}`;
      }
    }

    return null;
  };

  const handlePostImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingPostImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      setNewPostImage(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingPostImage(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !newPostVideo.trim() && !newPostImage) return;

    setPosting(true);
    try {
      const videoEmbed = getYouTubeEmbedUrl(newPostVideo);

      const { data, error } = await supabase
        .from('posts')
        .insert([{
          author_id: user.id,
          content: newPost,
          video_url: videoEmbed,
          image_url: newPostImage
        }])
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, full_name, avatar_url),
          post_likes(id, profile_id),
          post_comments(id)
        `)
        .single();

      if (error) throw error;

      setPosts([data, ...posts]);
      setNewPost('');
      setNewPostVideo('');
      setNewPostImage(null);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const post = posts.find((p) => p.id === postId);
      const hasLiked = post.post_likes.some((like) => like.profile_id === user.id);

      if (hasLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('profile_id', user.id);

        if (error) throw error;

        setPosts(
          posts.map((p) =>
            p.id === postId
              ? { ...p, post_likes: p.post_likes.filter((l) => l.profile_id !== user.id) }
              : p
          )
        );
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert([{ post_id: postId, profile_id: user.id }]);

        if (error) throw error;

        setPosts(
          posts.map((p) =>
            p.id === postId
              ? { ...p, post_likes: [...p.post_likes, { profile_id: user.id }] }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleComments = async (postId) => {
    const willShow = !showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: willShow }));

    if (willShow && !postComments[postId]) {
      await fetchPostComments(postId);
    }
  };

  const fetchPostComments = async (postId) => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          author:profiles!post_comments_author_id_fkey(id, full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPostComments(prev => ({ ...prev, [postId]: data || [] }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (postId) => {
    if (!newComment[postId]?.trim()) return;

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert([{
          post_id: postId,
          author_id: user.id,
          content: newComment[postId]
        }])
        .select(`
          *,
          author:profiles!post_comments_author_id_fkey(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data]
      }));

      setPosts(posts.map(p =>
        p.id === postId
          ? { ...p, post_comments: [...p.post_comments, { id: data.id }] }
          : p
      ));

      setNewComment(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="flex gap-8 max-w-7xl mx-auto py-8 px-4">
      {/* Left Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
          <button
            onClick={() => setActiveView('feed')}
            className="flex items-center space-x-3 px-4 py-3 bg-adopteez-primary text-white rounded-full hover:bg-adopteez-dark transition-colors w-full text-left"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <HomeIcon size={18} />
            </div>
            <span className="font-medium">{t('nav.forside')}</span>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              chatManagerRef.current?.openChatMenu();
            }}
            className="flex items-center justify-between space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-full transition-colors w-full text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle size={18} />
              </div>
              <span className="font-medium">{t('nav.chat')}</span>
            </div>
            {unreadMessageCount > 0 && (
              <span className="text-xs text-gray-600">({unreadMessageCount})</span>
            )}
          </button>

          <button
            onClick={() => setActiveView('groups')}
            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-full transition-colors w-full text-left"
          >
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Users size={18} />
            </div>
            <span className="font-medium">{t('nav.groups')}</span>
          </button>

          <button
            onClick={() => setActiveView('events')}
            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-full transition-colors w-full text-left"
          >
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <span className="font-medium">{t('nav.events')}</span>
          </button>
        </div>

        <div style={{ marginTop: '50px' }}>
          <CalendarWidget />
        </div>
      </aside>

      {/* Main Feed */}
      <main className="flex-1 max-w-2xl">
        {activeView === 'feed' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <form onSubmit={handleCreatePost} className="space-y-3">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={`${t('posts.whatsOnYourMind')}, ${profile?.full_name?.split(' ')[0] || ''}?`}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-adopteez-primary resize-none"
                rows="3"
              />

              {newPostImage && (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={newPostImage} alt="Preview" className="w-full h-auto" />
                  <button
                    type="button"
                    onClick={() => setNewPostImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}

              <input
                type="text"
                value={newPostVideo}
                onChange={(e) => setNewPostVideo(e.target.value)}
                placeholder={t('posts.pasteVideoLink')}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-adopteez-primary"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 cursor-pointer transition-colors">
                  <Image size={18} />
                  <span className="text-sm font-medium">{uploadingPostImage ? t('posts.uploading') : t('posts.photo')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePostImageChange}
                    className="hidden"
                    disabled={uploadingPostImage}
                  />
                </label>
                <button
                  type="submit"
                  disabled={(!newPost.trim() && !newPostVideo.trim() && !newPostImage) || posting || uploadingPostImage}
                  className="px-6 py-3 bg-adopteez-primary text-white rounded-full hover:bg-adopteez-dark transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {posting ? t('posts.posting') : t('posts.post')}
                </button>
              </div>
            </form>
          </div>

          {feedItems.map((item) => {
            if (item.type === 'discussion') {
              return (
                <article key={`discussion-${item.id}`} className="bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 border-adopteez-accent">
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      {item.author?.avatar_url ? (
                        <img
                          src={item.author.avatar_url}
                          alt={item.author.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold">
                          {item.author?.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.author?.full_name}</h4>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })} • i {item.group?.name}
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-adopteez-light text-adopteez-dark rounded-full text-xs font-medium">
                        Debat
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-700 mb-3 leading-relaxed line-clamp-3">{item.content}</p>

                    <Link
                      to={`/groups/${item.group_id}`}
                      className="inline-flex items-center space-x-2 text-adopteez-primary hover:text-adopteez-dark font-semibold text-sm transition-colors"
                    >
                      <MessageCircle size={16} />
                      <span>Se debat og svar ({item.discussion_replies?.length || 0})</span>
                    </Link>
                  </div>
                </article>
              );
            }

            const post = item;
            const hasLiked = post.post_likes.some((like) => like.profile_id === user.id);
            const likeCount = post.post_likes.length;
            const commentCount = post.post_comments.length;

            return (
              <article key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    {post.author?.avatar_url ? (
                      <img
                        src={post.author.avatar_url}
                        alt={post.author.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold">
                        {post.author?.full_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{post.author?.full_name}</h4>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-900 mb-3 leading-relaxed">{post.content}</p>

                  {post.image_url && (
                    <div className="rounded-xl overflow-hidden mb-3">
                      <img
                        src={post.image_url}
                        alt="Post"
                        className="w-full h-auto"
                      />
                    </div>
                  )}

                  {post.video_url && (
                    <div className="relative w-full mb-3" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={post.video_url}
                        title="YouTube video player"
                        className="absolute top-0 left-0 w-full h-full rounded-xl"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>

                <div className="mt-3 border-t border-gray-200"></div>

                <div className="px-4 py-1 flex items-center justify-around bg-gray-50">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-1 justify-center"
                  >
                    <Heart size={20} fill={hasLiked ? 'currentColor' : 'none'} className={hasLiked ? 'text-adopteez-accent' : ''} />
                    <span className="text-sm font-medium">Like</span>
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-1 justify-center"
                  >
                    <MessageCircle size={20} />
                    <span className="text-sm font-medium">{t('posts.comment')}</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-1 justify-center">
                    <Share2 size={20} />
                    <span className="text-sm font-medium">{t('posts.share')}</span>
                  </button>
                </div>

                {(likeCount > 0 || commentCount > 0) && (
                  <div className="px-6 py-2 text-xs text-gray-500 border-t border-gray-200 bg-white">
                    {likeCount > 0 && <span>{likeCount} {t('posts.liked')}</span>}
                    {likeCount > 0 && commentCount > 0 && <span className="mx-2">•</span>}
                    {commentCount > 0 && <span>{commentCount} {t('posts.comments')}</span>}
                  </div>
                )}

                {showComments[post.id] && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="space-y-4 mt-4">
                      {postComments[post.id]?.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          {comment.author?.avatar_url ? (
                            <img
                              src={comment.author.avatar_url}
                              alt={comment.author.full_name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {comment.author?.full_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-2xl px-4 py-2">
                              <p className="font-semibold text-sm text-gray-900">{comment.author?.full_name}</p>
                              <p className="text-gray-800 text-sm">{comment.content}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 ml-4">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-3 mt-4">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="flex-1 flex space-x-2">
                        <input
                          type="text"
                          placeholder="Skriv en kommentar..."
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                          className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-adopteez-primary"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newComment[post.id]?.trim()}
                          className="p-2 bg-adopteez-primary text-white rounded-full hover:bg-adopteez-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {feedItems.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <MessageCircle size={48} className="mx-auto text-adopteez-primary mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ingen opslag endnu</h3>
              <p className="text-gray-600">Vær den første til at dele noget med fællesskabet!</p>
            </div>
          )}
        </div>
        ) : activeView === 'groups' ? (
        <div className="space-y-6">
          {userGroups.map((group) => {
            const memberCount = group.group_members?.length || 0;
            return (
              <Link
                key={group.id}
                to={`/groups/${group.id}`}
                className="block bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {group.banner_url && (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={group.banner_url}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
                      {group.adoption_country && (
                        <p className="text-sm text-adopteez-primary font-medium mb-2">
                          {group.adoption_country}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Users size={16} />
                      <span>{memberCount}</span>
                    </div>
                  </div>
                  {group.description && (
                    <p className="text-gray-700 mb-3 line-clamp-2">{group.description}</p>
                  )}
                  <div className="flex items-center justify-end">
                    <span className="text-adopteez-primary font-semibold text-sm hover:text-adopteez-dark">
                      Se gruppe →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {userGroups.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Du er ikke medlem af nogen grupper endnu</h3>
              <p className="text-gray-600 mb-4">Tilmeld dig en gruppe for at komme i kontakt med andre familier</p>
              <Link
                to="/groups"
                className="inline-block px-6 py-3 bg-adopteez-primary text-white rounded-lg hover:bg-adopteez-dark transition-colors font-medium"
              >
                Find grupper
              </Link>
            </div>
          )}
        </div>
        ) : activeView === 'events' ? (
        <div className="space-y-6">
          {events.map((event) => {
            const isRegistered = event.event_attendees.some(
              (attendee) => attendee.profile_id === user.id
            );
            const attendeeCount = event.event_attendees.length;

            return (
              <div key={event.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">{event.group?.name}</span>
                    </div>
                  </div>
                  {!isRegistered ? (
                    <button
                      onClick={() => handleRegister(event.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Tilmeld
                    </button>
                  ) : (
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                      Tilmeldt
                    </span>
                  )}
                </div>

                {event.description && (
                  <p className="text-gray-700 mb-4">{event.description}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar size={18} className="mr-2 text-blue-600" />
                    <span>
                      {format(new Date(event.start_date), 'PPP')} kl.{' '}
                      {format(new Date(event.start_date), 'p')}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center">
                      <MapPin size={18} className="mr-2 text-green-600" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.is_paid && event.price && (
                    <div className="flex items-center">
                      <DollarSign size={18} className="mr-2 text-yellow-600" />
                      <span>
                        {event.price} {event.currency || 'USD'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Users size={18} className="mr-2 text-purple-600" />
                    <span>
                      {attendeeCount} deltagere
                      {event.max_attendees && ` / ${event.max_attendees}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {events.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingen kommende begivenheder</h3>
              <p className="text-gray-600">Kom tilbage senere for nye begivenheder</p>
            </div>
          )}
        </div>
        ) : null}
      </main>

      {/* Right Sidebar */}
      <aside className="hidden xl:block w-80 flex-shrink-0">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 text-lg leading-relaxed" style={{ marginBottom: '15px' }}>{t('groups.suggestions')}</h3>
            {partnerGroups.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {partnerGroups.map((group) => (
                  <div key={group.id} className="border border-gray-200 rounded-xl p-5 hover:border-adopteez-primary transition-colors">
                    <div className="flex items-start" style={{ gap: '15px', marginBottom: '5px' }}>
                      <div className="w-14 h-14 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users size={24} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm mb-1 leading-tight">{group.name}</h4>
                        {group.partner_organization && (
                          <p className="text-xs text-adopteez-primary font-medium mb-1">
                            {group.partner_organization.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-600 line-clamp-2">{group.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinPartnerGroup(group)}
                      className="w-full text-xs font-medium text-white bg-adopteez-accent px-4 py-3 rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Users size={14} />
                      <span>{group.requires_verification ? t('groups.joinWithCode') : t('groups.joinGroup')}</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">{t('groups.noSuggestions')}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-2 text-lg">{t('home.friendSuggestions')}</h3>
            <p className="text-xs text-gray-600 mb-4">{t('home.friendSuggestionsSubtitle')}</p>
            {suggestedFriends.length > 0 ? (
              <div className="space-y-3">
                {suggestedFriends.map((friend) => (
                  <div key={friend.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-adopteez-primary to-adopteez-accent">
                      {friend.avatar_url ? (
                        <img
                          src={friend.avatar_url}
                          alt={friend.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">
                          {friend.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 truncate">{friend.full_name}</h4>
                      <p className="text-xs text-gray-500">{friend.country || 'Denmark'}</p>
                    </div>
                    <button className="text-xs text-white bg-adopteez-accent px-3 py-1.5 rounded-full hover:bg-opacity-90 transition-colors flex-shrink-0">
                      Tilføj
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">{t('home.noFriendSuggestions')}</p>
            )}
          </div>

          <div className="bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-2xl shadow-sm p-6 text-white">
            <h3 className="font-bold text-lg mb-2">{t('home.recommend')}</h3>
            <p className="text-sm text-white/90 mb-4">
              {t('home.recommendSubtitle')}
            </p>
            <a
              href="https://www.facebook.com/sharer/sharer.php?u=https://adopteez.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-white text-adopteez-primary px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
            >
              {t('home.shareOnFacebook')}
            </a>
          </div>

          <FeedbackWidget />
        </div>
      </aside>

      {showVerificationModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verificer medlemskab</h3>
              <p className="text-sm text-gray-600 mb-1">
                For at tilmelde dig <span className="font-semibold">{selectedGroup.name}</span> skal du indtaste en verificeringskode.
              </p>
              {selectedGroup.partner_organization && (
                <p className="text-xs text-adopteez-primary">
                  Fra {selectedGroup.partner_organization.name}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verificeringskode (f.eks. medlemsnummer)
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value);
                  setVerificationError('');
                }}
                placeholder="Indtast din kode"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                autoFocus
              />
              {verificationError && (
                <p className="mt-2 text-sm text-red-600">{verificationError}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-blue-800">
                <strong>Tip:</strong> Verificeringskoden kan være dit medlemsnummer eller en speciel kode du har modtaget fra {selectedGroup.partner_organization?.name || 'organisationen'}.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setSelectedGroup(null);
                  setVerificationCode('');
                  setVerificationError('');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Annuller
              </button>
              <button
                onClick={handleVerifyAndJoin}
                className="flex-1 px-4 py-3 bg-adopteez-accent text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
              >
                Verificer og tilmeld
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatManager ref={chatManagerRef} />
    </div>
  );
}
