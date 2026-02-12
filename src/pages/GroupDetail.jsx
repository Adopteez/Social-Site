import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, Calendar, MessageSquare, Image as ImageIcon, BookOpen, ArrowLeft, Send, Heart, MessageCircle, MapPin as MapPinIcon, MessageCircleMore, Flag, MoreVertical, Settings, Info, AlertCircle, Pin } from 'lucide-react';
import DiscussionModal from '../components/DiscussionModal';
import ReportModal from '../components/ReportModal';
import PartnerGroupAccessModal from '../components/PartnerGroupAccessModal';
import FamilyStoryModal from '../components/FamilyStoryModal';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getTranslatedGroupName } from '../utils/groupNameTranslation';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';

const getCityCoordinates = (city, isWorldwide) => {
  const danishCities = {
    'copenhagen': [12.5683, 55.6761],
    'københavn': [12.5683, 55.6761],
    'aarhus': [10.2039, 56.1629],
    'odense': [10.4028, 55.4038],
    'aalborg': [9.9187, 57.0488],
    'esbjerg': [8.4521, 55.4760],
    'randers': [10.0364, 56.4607],
    'kolding': [9.4721, 55.4904],
    'horsens': [9.8501, 55.8609],
    'vejle': [9.5357, 55.7089],
    'roskilde': [12.0803, 55.6415],
    'herning': [8.9768, 56.1357],
    'silkeborg': [9.5450, 56.1697],
    'næstved': [11.7611, 55.2298],
    'fredericia': [9.7516, 55.5658],
    'viborg': [9.4021, 56.4535],
    'køge': [12.1819, 55.4580],
    'holstebro': [8.6179, 56.3602],
    'taastrup': [12.2971, 55.6509],
    'slagelse': [11.3542, 55.4028],
    'middelfart': [9.7309, 55.5060]
  };

  const worldwideCities = {
    'copenhagen': [12.5683, 55.6761],
    'københavn': [12.5683, 55.6761],
    'aarhus': [10.2039, 56.1629],
    'odense': [10.4028, 55.4038],
    'aalborg': [9.9187, 57.0488],
    'esbjerg': [8.4521, 55.4760],
    'randers': [10.0364, 56.4607],
    'kolding': [9.4721, 55.4904],
    'horsens': [9.8501, 55.8609],
    'vejle': [9.5357, 55.7089],
    'roskilde': [12.0803, 55.6415],
    'herning': [8.9768, 56.1357],
    'silkeborg': [9.5450, 56.1697],
    'næstved': [11.7611, 55.2298],
    'fredericia': [9.7516, 55.5658],
    'viborg': [9.4021, 56.4535],
    'køge': [12.1819, 55.4580],
    'holstebro': [8.6179, 56.3602],
    'taastrup': [12.2971, 55.6509],
    'slagelse': [11.3542, 55.4028],
    'middelfart': [9.7309, 55.5060],
    'stockholm': [18.0686, 59.3293],
    'oslo': [10.7522, 59.9139],
    'helsinki': [24.9384, 60.1699],
    'london': [  -0.1276, 51.5074],
    'berlin': [13.4050, 52.5200],
    'paris': [2.3522, 48.8566],
    'madrid': [-3.7038, 40.4168],
    'rome': [12.4964, 41.9028],
    'amsterdam': [4.8952, 52.3702],
    'brussels': [4.3517, 50.8503],
    'vienna': [16.3738, 48.2082],
    'prague': [14.4378, 50.0755],
    'budapest': [19.0402, 47.4979],
    'warsaw': [21.0122, 52.2297],
    'new york': [-74.0060, 40.7128],
    'los angeles': [-118.2437, 34.0522],
    'chicago': [-87.6298, 41.8781],
    'toronto': [-79.3832, 43.6532],
    'sydney': [151.2093, -33.8688],
    'tokyo': [139.6917, 35.6895],
    'beijing': [116.4074, 39.9042],
    'shanghai': [121.4737, 31.2304],
    'mumbai': [72.8777, 19.0760],
    'dubai': [55.2708, 25.2048],
    'singapore': [103.8198, 1.3521],
    'seoul': [126.9780, 37.5665],
    'bangkok': [100.5018, 13.7563],
    'moscow': [37.6173, 55.7558],
    'istanbul': [28.9784, 41.0082]
  };

  const cityMap = isWorldwide ? worldwideCities : danishCities;
  const cityKey = city.toLowerCase().trim();

  return cityMap[cityKey] || null;
};

export default function GroupDetail() {
  const { groupId } = useParams();
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [familyStories, setFamilyStories] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [children, setChildren] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [newReply, setNewReply] = useState({});
  const [adminRequests, setAdminRequests] = useState([]);
  const [userObjections, setUserObjections] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportType, setReportType] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedStory, setSelectedStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [newComment, setNewComment] = useState({});
  const [selectedChild, setSelectedChild] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [expandedEventAttendees, setExpandedEventAttendees] = useState(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    location: '',
    location_searchable: '',
    event_type: 'physical',
    timezone: 'Europe/Copenhagen',
    start_date: '',
    start_time: '',
    end_time: '',
    deadline_rsvp: '',
    price: '',
    currency: 'DKK'
  });
  const [viewState, setViewState] = useState({
    longitude: 10.0,
    latitude: 56.0,
    zoom: 6
  });

  useEffect(() => {
    if (group?.residence_country) {
      const countryCoordinates = {
        'Denmark': { longitude: 10.0, latitude: 56.0, zoom: 6.5 },
        'Sweden': { longitude: 15.0, latitude: 62.0, zoom: 4.5 },
        'Norway': { longitude: 10.0, latitude: 64.0, zoom: 4.5 },
        'Finland': { longitude: 26.0, latitude: 64.0, zoom: 4.5 },
        'Germany': { longitude: 10.5, latitude: 51.0, zoom: 5.5 },
        'Netherlands': { longitude: 5.5, latitude: 52.2, zoom: 7 },
        'Belgium': { longitude: 4.5, latitude: 50.5, zoom: 7.5 },
        'France': { longitude: 2.0, latitude: 46.5, zoom: 5 },
        'Spain': { longitude: -3.7, latitude: 40.4, zoom: 5.5 },
        'Italy': { longitude: 12.5, latitude: 42.8, zoom: 5.5 },
        'United Kingdom': { longitude: -2.0, latitude: 54.0, zoom: 5.5 }
      };

      const coords = countryCoordinates[group.residence_country] || { longitude: 0, latitude: 20, zoom: 2 };
      setViewState(coords);
    }
  }, [group?.residence_country]);

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
      fetchAdminRequests();
    }
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      await Promise.all([
        fetchGroup(),
        fetchMembers(),
        fetchEvents(),
        fetchPosts(),
        fetchFamilyStories(),
        fetchPhotos(),
        fetchChildren(),
        fetchDiscussions(),
      ]);
    } catch (error) {
      console.error('Error fetching group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroup = async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .maybeSingle();

    if (error) throw error;
    setGroup(data);
  };

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        profile:profiles(id, full_name, email, avatar_url)
      `)
      .eq('group_id', groupId);

    if (error) throw error;
    setMembers(data || []);

    if (data && user) {
      const memberRecord = data.find(m => m.profile_id === user.id);
      if (memberRecord) {
        setIsMember(true);
        if (memberRecord.role === 'admin') {
          setIsGroupAdmin(true);
        }
      }
    }
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!events_organizer_id_fkey(full_name, avatar_url),
        event_attendees(
          id,
          status,
          profile_id,
          payment_status,
          payment_date,
          profile:profiles(full_name, avatar_url)
        )
      `)
      .eq('group_id', groupId)
      .order('start_date', { ascending: true });

    if (error) throw error;
    setEvents(data || []);
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(full_name, avatar_url),
        post_comments(
          *,
          author:profiles!post_comments_author_id_fkey(full_name, avatar_url)
        ),
        post_likes(profile_id)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setPosts(data || []);
  };

  const fetchFamilyStories = async () => {
    const { data, error } = await supabase
      .from('family_stories')
      .select(`
        *,
        profile:profiles(full_name, avatar_url, city, country),
        family_story_members(
          profile_id,
          child_id,
          profiles(id, full_name, avatar_url),
          children(id, name, image_url)
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    console.log('Family stories:', data);
    setFamilyStories(data || []);
  };

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from('group_photos')
      .select(`
        *,
        profile:profiles(full_name)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setPhotos(data || []);
  };

  const fetchChildren = async () => {
    const { data: groupMembers, error: membersError } = await supabase
      .from('group_members')
      .select('profile_id')
      .eq('group_id', groupId);

    if (membersError) throw membersError;

    const memberIds = groupMembers?.map(m => m.profile_id) || [];

    if (memberIds.length === 0) {
      setChildren([]);
      return;
    }

    const { data, error } = await supabase
      .from('children')
      .select(`
        *,
        profile:profiles(full_name, avatar_url)
      `)
      .in('profile_id', memberIds)
      .not('current_city', 'is', null);

    if (error) throw error;
    setChildren(data || []);
  };

  const fetchDiscussions = async () => {
    const { data, error } = await supabase
      .from('group_discussions')
      .select(`
        *,
        author:profiles!group_discussions_profile_id_fkey(id, full_name, avatar_url),
        discussion_replies(
          id,
          content,
          created_at,
          author:profiles!discussion_replies_profile_id_fkey(id, full_name, avatar_url)
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const sortedData = (data || []).sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    setDiscussions(sortedData);
  };

  const handlePinDiscussion = async (discussionId, currentlyPinned) => {
    try {
      const { error } = await supabase
        .from('group_discussions')
        .update({
          pinned: !currentlyPinned,
          pinned_at: !currentlyPinned ? new Date().toISOString() : null,
          pinned_by: !currentlyPinned ? user.id : null
        })
        .eq('id', discussionId);

      if (error) throw error;

      fetchDiscussions();
    } catch (error) {
      console.error('Error pinning discussion:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            author_id: user.id,
            group_id: groupId,
            content: newPost,
          },
        ]);

      if (error) throw error;

      setNewPost('');
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleAddComment = async (postId) => {
    const commentText = newComment[postId];
    if (!commentText?.trim()) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert([
          {
            post_id: postId,
            author_id: user.id,
            content: commentText,
          },
        ]);

      if (error) throw error;

      setNewComment({ ...newComment, [postId]: '' });
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const fetchAdminRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_requests')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin requests:', error);
        return;
      }

      console.log('Admin requests data:', data);

      if (data && data.length > 0) {
        // Fetch profiles for all users
        const userIds = data.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        const profileMap = {};
        profiles?.forEach(p => {
          profileMap[p.id] = p;
        });

        // Fetch objection counts
        const requestIds = data.map(r => r.id);
        const { data: objections } = await supabase
          .from('admin_request_objections')
          .select('request_id')
          .in('request_id', requestIds);

        const objectionCounts = {};
        objections?.forEach(obj => {
          objectionCounts[obj.request_id] = (objectionCounts[obj.request_id] || 0) + 1;
        });

        const enrichedData = data.map(req => ({
          ...req,
          profile: profileMap[req.user_id],
          objection_count: objectionCounts[req.id] || 0
        }));

        setAdminRequests(enrichedData);
      } else {
        setAdminRequests([]);
      }

      if (user) {
        const { data: userObjs } = await supabase
          .from('admin_request_objections')
          .select('request_id')
          .eq('user_id', user.id);

        const objectionsMap = {};
        userObjs?.forEach(obj => {
          objectionsMap[obj.request_id] = true;
        });
        setUserObjections(objectionsMap);
      }
    } catch (error) {
      console.error('Error fetching admin requests:', error);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventForm.title.trim() || !eventForm.start_date) return;

    try {
      const startDateTime = eventForm.start_time
        ? `${eventForm.start_date}T${eventForm.start_time}:00`
        : `${eventForm.start_date}T00:00:00`;

      const { error } = await supabase
        .from('events')
        .insert([
          {
            group_id: groupId,
            organizer_id: user.id,
            title: eventForm.title,
            description: eventForm.description,
            location: eventForm.location,
            location_searchable: eventForm.location_searchable,
            event_type: eventForm.event_type,
            timezone: eventForm.timezone,
            start_date: startDateTime,
            start_time: eventForm.start_time || null,
            end_time: eventForm.end_time || null,
            deadline_rsvp: eventForm.deadline_rsvp || null,
            is_paid: eventForm.price ? true : false,
            price: eventForm.price || null,
            currency: eventForm.currency,
          },
        ]);

      if (error) throw error;

      setShowEventModal(false);
      setEventForm({
        title: '',
        description: '',
        location: '',
        location_searchable: '',
        event_type: 'physical',
        timezone: 'Europe/Copenhagen',
        start_date: '',
        start_time: '',
        end_time: '',
        deadline_rsvp: '',
        price: '',
        currency: 'DKK'
      });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const handleCreateDiscussion = async (formData) => {
    try {
      const { error } = await supabase
        .from('group_discussions')
        .insert([
          {
            group_id: groupId,
            user_id: user.id,
            title: formData.title,
            content: formData.content,
          },
        ]);

      if (error) throw error;

      setShowDiscussionModal(false);
      fetchDiscussions();
    } catch (error) {
      console.error('Error creating discussion:', error);
      alert('Failed to create discussion. Please try again.');
    }
  };

  const handleAddReply = async (discussionId) => {
    const replyText = newReply[discussionId];
    if (!replyText?.trim()) return;

    try {
      const { error } = await supabase
        .from('discussion_replies')
        .insert([
          {
            discussion_id: discussionId,
            user_id: user.id,
            content: replyText,
          },
        ]);

      if (error) throw error;

      setNewReply({ ...newReply, [discussionId]: '' });
      fetchDiscussions();
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply. Please try again.');
    }
  };

  const handleReportPost = (postId) => {
    setReportTarget(postId);
    setReportType('post');
    setShowReportModal(true);
  };

  const handleReportMember = (memberId, memberName) => {
    setReportTarget({ id: memberId, name: memberName });
    setReportType('member');
    setShowReportModal(true);
  };

  const handleSubmitReport = async (reason) => {
    try {
      if (reportType === 'post') {
        const { error } = await supabase
          .from('post_reports')
          .insert([
            {
              post_id: reportTarget,
              reporter_id: user.id,
              reason: reason,
            },
          ]);

        if (error) throw error;
        alert('Tak for din anmeldelse. Den vil blive behandlet af administratorer.');
      } else if (reportType === 'member') {
        const { error } = await supabase
          .from('member_reports')
          .insert([
            {
              group_id: groupId,
              reported_member_id: reportTarget.id,
              reporter_id: user.id,
              reason: reason,
            },
          ]);

        if (error) throw error;
        alert('Tak for din anmeldelse. Den vil blive behandlet af administratorer.');
      }

      setShowReportModal(false);
      setReportTarget(null);
      setReportType(null);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Kunne ikke sende anmeldelse. Prøv venligst igen.');
    }
  };

  const handleRSVP = async (eventId, status, event) => {
    try {
      const { data: existing } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', eventId)
        .eq('profile_id', user.id)
        .maybeSingle();

      const paymentStatus = (status === 'yes' && event.is_paid) ? 'pending' : 'not_required';

      if (existing) {
        const { error } = await supabase
          .from('event_attendees')
          .update({
            status,
            payment_status: paymentStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('event_attendees')
          .insert([
            {
              event_id: eventId,
              profile_id: user.id,
              status,
              payment_status: paymentStatus,
            },
          ]);

        if (error) throw error;
      }

      fetchEvents();

      if (status === 'yes' && event.is_paid) {
        handlePayment(event);
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
      alert('Failed to update RSVP. Please try again.');
    }
  };

  const handlePayment = async (event) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'event',
          event_id: event.id,
          event_title: event.title,
          event_price: event.price,
          currency: event.currency || 'DKK',
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        alert(`Error: ${error}`);
        return;
      }

      window.location.href = url;
    } catch (err) {
      console.error('Payment error:', err);
      alert('Failed to start payment process. Please try again.');
    }
  };

  const handleJoinGroup = async () => {
    if (group.group_type === 'partner' && group.access_type !== 'open') {
      setShowAccessModal(true);
      return;
    }

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          profile_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      await fetchMembers();
      alert('Du er nu medlem af gruppen!');
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Fejl ved tilmelding til gruppe');
    }
  };

  const handlePartnerGroupAccess = async (accessValue) => {
    try {
      if (group.access_type === 'code') {
        if (accessValue !== group.access_code) {
          alert('Forkert adgangskode');
          return;
        }

        const { error } = await supabase
          .from('group_members')
          .insert({
            group_id: groupId,
            profile_id: user.id,
            role: 'member'
          });

        if (error) throw error;

        await fetchMembers();
        setShowAccessModal(false);
        alert('Du er nu medlem af gruppen!');
      } else if (group.access_type === 'member_number' || group.access_type === 'approval') {
        const { error } = await supabase
          .from('group_join_requests')
          .insert({
            group_id: groupId,
            profile_id: user.id,
            member_number: accessValue || null,
            status: 'pending'
          });

        if (error) {
          if (error.code === '23505') {
            alert('Du har allerede sendt en anmodning til denne gruppe');
          } else {
            throw error;
          }
          return;
        }

        setShowAccessModal(false);
        alert(group.access_type === 'approval'
          ? 'Din anmodning er sendt til gruppeadministratoren'
          : 'Din anmodning er sendt. Vent på godkendelse.');
      }
    } catch (error) {
      console.error('Error handling partner group access:', error);
      alert('Fejl ved tilmelding');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Group not found</h2>
        <Link to="/groups" className="text-adopteez-primary hover:text-adopteez-dark font-semibold">
          ← {t('groups.backToGroups')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {group.banner_url ? (
          <div className="h-48 relative overflow-hidden">
            <img
              src={group.banner_url}
              alt={group.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-adopteez-secondary via-adopteez-primary to-adopteez-accent relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        )}
        <div className="px-8 pb-6">
          <div className="flex items-end justify-between -mt-16 mb-6">
            <div className="flex items-end space-x-5">
              {group.avatar_url ? (
                group.avatar_url.includes(',') ? (
                  <div className="relative w-32 h-32 bg-white rounded-2xl shadow-2xl border-4 border-white overflow-hidden">
                    <div className="flex h-full">
                      <img
                        src={group.avatar_url.split(',')[0]}
                        alt="Flag 1"
                        className="w-1/2 h-full object-cover"
                      />
                      <img
                        src={group.avatar_url.split(',')[1]}
                        alt="Flag 2"
                        className="w-1/2 h-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-white rounded-2xl shadow-2xl border-4 border-white overflow-hidden">
                    <img
                      src={group.avatar_url}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )
              ) : (
                <div className="w-32 h-32 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-4xl font-bold text-adopteez-primary border-4 border-white">
                  {group.name[0].toUpperCase()}
                </div>
              )}
              <div className="pb-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{getTranslatedGroupName(group, t)}</h1>
                <p className="text-gray-600 text-lg">{members.length} {t('groups.members')}</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              {!isMember && (
                <button
                  onClick={handleJoinGroup}
                  className="mb-2 px-6 py-2.5 bg-adopteez-primary text-white hover:bg-adopteez-accent rounded-xl transition-all font-semibold"
                >
                  Deltag i gruppe
                </button>
              )}
              {isGroupAdmin && group.group_type === 'partner' && (
                <Link
                  to={`/groups/${groupId}/admin`}
                  className="mb-2 px-6 py-2.5 bg-adopteez-accent text-white hover:bg-adopteez-primary rounded-xl transition-all font-semibold flex items-center gap-2"
                >
                  <Settings size={18} />
                  <span>Gruppeadmin</span>
                </Link>
              )}
              <Link
                to="/groups"
                className="mb-2 px-6 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-all flex items-center space-x-2 font-semibold"
              >
                <ArrowLeft size={18} />
                <span>{t('groups.backToGroups')}</span>
              </Link>
            </div>
          </div>

          <div className="h-6"></div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3 overflow-x-auto">
              <button
                onClick={() => setActiveTab('feed')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all whitespace-nowrap border-2 ${
                  activeTab === 'feed'
                    ? 'bg-adopteez-primary text-white border-adopteez-primary shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-adopteez-primary hover:text-adopteez-primary'
                }`}
              >
                <MessageSquare size={20} />
                <span>{t('groups.feed')}</span>
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all whitespace-nowrap border-2 ${
                  activeTab === 'members'
                    ? 'bg-adopteez-primary text-white border-adopteez-primary shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-adopteez-primary hover:text-adopteez-primary'
                }`}
              >
                <Users size={20} />
                <span>{t('groups.members')}</span>
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all whitespace-nowrap border-2 ${
                  activeTab === 'events'
                    ? 'bg-adopteez-primary text-white border-adopteez-primary shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-adopteez-primary hover:text-adopteez-primary'
                }`}
              >
                <Calendar size={20} />
                <span>{t('groups.events')}</span>
              </button>
              <button
                onClick={() => setActiveTab('stories')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all whitespace-nowrap border-2 ${
                  activeTab === 'stories'
                    ? 'bg-adopteez-primary text-white border-adopteez-primary shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-adopteez-primary hover:text-adopteez-primary'
                }`}
              >
                <BookOpen size={20} />
                <span>{t('groups.familyStories')}</span>
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all whitespace-nowrap border-2 ${
                  activeTab === 'photos'
                    ? 'bg-adopteez-primary text-white border-adopteez-primary shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-adopteez-primary hover:text-adopteez-primary'
                }`}
              >
                <ImageIcon size={20} />
                <span>{t('groups.photos')}</span>
              </button>
              <button
                onClick={() => setActiveTab('childrens-map')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all whitespace-nowrap border-2 ${
                  activeTab === 'childrens-map'
                    ? 'bg-adopteez-primary text-white border-adopteez-primary shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-adopteez-primary hover:text-adopteez-primary'
                }`}
              >
                <MapPinIcon size={20} />
                <span>{t('groups.childrensMap')}</span>
              </button>
              <button
                onClick={() => setActiveTab('discussions')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all whitespace-nowrap border-2 ${
                  activeTab === 'discussions'
                    ? 'bg-adopteez-primary text-white border-adopteez-primary shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-adopteez-primary hover:text-adopteez-primary'
                }`}
              >
                <MessageCircleMore size={20} />
                <span>{t('groups.discussions')}</span>
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all whitespace-nowrap border-2 ${
                  activeTab === 'about'
                    ? 'bg-adopteez-primary text-white border-adopteez-primary shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-adopteez-primary hover:text-adopteez-primary'
                }`}
              >
                <Info size={20} />
                <span>{t('groups.about')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-6"></div>

      {activeTab === 'feed' && (
        <div className="space-y-1.5">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex space-x-4">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold">
                  {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share something with the group..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent resize-none"
                  rows="3"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.trim()}
                    className="px-6 py-2.5 bg-adopteez-primary text-white rounded-xl hover:bg-adopteez-dark transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send size={18} />
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className={`rounded-2xl shadow-sm p-6 ${post.is_system_post ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300' : 'bg-white'}`}>
                <div className="flex items-start space-x-4 mb-4">
                  {post.is_system_post ? (
                    post.system_author_avatar ? (
                      <img src={post.system_author_avatar} alt={post.system_author_name} className="w-12 h-12 rounded-full object-cover border-2 border-adopteez-primary" />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold">
                        A
                      </div>
                    )
                  ) : post.author?.avatar_url ? (
                    <img src={post.author.avatar_url} alt={post.author.full_name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold">
                      {post.author?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {post.is_system_post ? post.system_author_name : (post.author?.full_name || 'Unknown')}
                    </h3>
                    <p className="text-sm text-gray-500">{format(new Date(post.created_at), 'PPp')}</p>
                  </div>
                  {!post.is_system_post && post.author_id !== user.id && (
                    <button
                      onClick={() => handleReportPost(post.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-2"
                      title="Anmeld opslag"
                    >
                      <Flag size={18} />
                    </button>
                  )}
                </div>
                <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

                {post.admin_request_id && (
                  <div className="mb-4 p-4 bg-white/50 rounded-xl border border-yellow-400">
                    <button
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from('admin_request_objections')
                            .insert([{
                              request_id: post.admin_request_id,
                              user_id: user.id
                            }]);

                          if (error) {
                            if (error.code === '23505') {
                              alert('You have already objected to this request.');
                            } else {
                              throw error;
                            }
                            return;
                          }

                          alert('Your objection has been recorded.');
                          fetchAdminRequests();
                          fetchPosts();
                        } catch (error) {
                          console.error('Error submitting objection:', error);
                          alert('Failed to submit objection. Please try again.');
                        }
                      }}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold flex items-center justify-center space-x-2"
                    >
                      <AlertCircle size={18} />
                      <span>Object to This Request</span>
                    </button>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Heart size={16} className="mr-1" />
                      {post.post_likes?.length || 0}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle size={16} className="mr-1" />
                      {post.post_comments?.length || 0}
                    </span>
                  </div>

                  {post.post_comments && post.post_comments.length > 0 && (
                    <div className="space-y-3 mb-4 ml-8">
                      {post.post_comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-start space-x-3">
                            {comment.author?.avatar_url ? (
                              <img src={comment.author.avatar_url} alt={comment.author.full_name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {comment.author?.full_name?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold text-sm text-gray-900">{comment.author?.full_name || 'Unknown'}</span>
                                <span className="text-xs text-gray-500">{format(new Date(comment.created_at), 'PPp')}</span>
                              </div>
                              <p className="text-gray-800 text-sm">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                      placeholder="Write a comment..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(post.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={!newComment[post.id]?.trim()}
                      className="px-4 py-2 bg-adopteez-light text-adopteez-dark rounded-xl hover:bg-adopteez-primary hover:text-white transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
              <div className="w-20 h-20 bg-adopteez-light/50 rounded-full flex items-center justify-center mx-auto mb-5">
                <MessageSquare size={40} className="text-adopteez-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600">Be the first to share something with the group</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-white rounded-2xl shadow-sm p-8 mt-40">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('groups.members')} ({members.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-6 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all">
                {member.profile?.avatar_url ? (
                  <img
                    src={member.profile.avatar_url}
                    alt={member.profile.full_name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {member.profile?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{member.profile?.full_name || 'Unknown'}</h3>
                  <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                </div>
                {member.profile_id !== user.id && (
                  <button
                    onClick={() => handleReportMember(member.profile_id, member.profile?.full_name)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-2"
                    title="Anmeld medlem"
                  >
                    <Flag size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="bg-white rounded-2xl shadow-sm p-8 mt-40">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Events</h2>
            <button
              onClick={() => setShowEventModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-adopteez-primary to-adopteez-accent text-white rounded-2xl hover:shadow-xl hover:scale-105 transition-all font-bold text-lg flex items-center gap-3"
            >
              <Calendar size={24} strokeWidth={2.5} />
              <span>{t('events.createEvent')}</span>
            </button>
          </div>
          {events.length > 0 ? (
            <div className="space-y-6">
              {events.map((event) => {
                const userRSVP = event.event_attendees?.find(a => a.profile_id === user.id);
                const attendingCount = event.event_attendees?.filter(a => a.status === 'yes').length || 0;
                const maybeCount = event.event_attendees?.filter(a => a.status === 'maybe').length || 0;

                return (
                  <div key={event.id} className="border-2 border-adopteez-light/50 rounded-xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
                        {event.organizer && (
                          <p className="text-sm text-gray-600 mb-2">{t('events.organizedBy')} {event.organizer.full_name}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                          event.event_type === 'online'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {event.event_type === 'online' ? '💻 Online' : `📍 ${t('events.physical')}`}
                        </span>
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-gray-700 mb-4">{event.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <Calendar size={18} className="text-adopteez-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">{t('events.dateTime')}</p>
                          <p className="text-gray-900">{format(new Date(event.start_date), 'PPP')}</p>
                          {event.start_time && (
                            <p className="text-sm text-gray-600">
                              {event.start_time}{event.end_time && ` - ${event.end_time}`}
                              {event.timezone && ` (${event.timezone})`}
                            </p>
                          )}
                        </div>
                      </div>

                      {(event.location || event.location_searchable) && (
                        <div className="flex items-start space-x-3">
                          <MapPinIcon size={18} className="text-adopteez-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-gray-700">{t('events.location')}</p>
                            <p className="text-gray-900">{event.location}</p>
                            {event.location_searchable && (
                              <p className="text-sm text-gray-600">{event.location_searchable}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {event.is_paid && event.price && (
                        <div className="flex items-start space-x-3">
                          <span className="text-adopteez-primary mt-0.5">💰</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Price</p>
                            <p className="text-gray-900">{event.price} {event.currency}</p>
                          </div>
                        </div>
                      )}

                      {event.deadline_rsvp && (
                        <div className="flex items-start space-x-3">
                          <span className="text-adopteez-primary mt-0.5">⏰</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-700">{t('events.rsvpDeadline')}</p>
                            <p className="text-gray-900">{format(new Date(event.deadline_rsvp), 'PPP')}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setExpandedEventAttendees(expandedEventAttendees === event.id ? null : event.id)}
                            className="text-sm text-adopteez-primary hover:text-adopteez-dark font-semibold flex items-center gap-1"
                          >
                            <Users size={16} />
                            <span className="font-semibold">{attendingCount}</span> {t('events.attending')}
                            {maybeCount > 0 && <span className="ml-2 text-gray-600"><span className="font-semibold">{maybeCount}</span> {t('events.maybe').toLowerCase()}</span>}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRSVP(event.id, 'yes', event)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                              userRSVP?.status === 'yes'
                                ? 'bg-adopteez-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {userRSVP?.status === 'yes' && event.is_paid && userRSVP.payment_status === 'pending' ? t('events.yesPay') : t('common.yes') || 'Yes'}
                          </button>
                          <button
                            onClick={() => handleRSVP(event.id, 'maybe', event)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                              userRSVP?.status === 'maybe'
                                ? 'bg-adopteez-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {t('events.maybe')}
                          </button>
                          <button
                            onClick={() => handleRSVP(event.id, 'no', event)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                              userRSVP?.status === 'no'
                                ? 'bg-gray-700 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {t('events.no')}
                          </button>
                        </div>
                      </div>

                      {userRSVP?.status === 'yes' && event.is_paid && userRSVP.payment_status === 'pending' && (
                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-700 font-semibold">⚠️ {t('events.paymentPending')}</span>
                              <span className="text-sm text-gray-600">{t('events.completePayment')}</span>
                            </div>
                            <button
                              onClick={() => handlePayment(event)}
                              className="px-4 py-2 bg-adopteez-primary text-white rounded-lg hover:bg-adopteez-dark font-semibold text-sm"
                            >
                              {t('events.payNow')}
                            </button>
                          </div>
                        </div>
                      )}

                      {userRSVP?.status === 'yes' && event.is_paid && userRSVP.payment_status === 'paid' && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-700 text-sm">
                            <span>✅ Payment Confirmed</span>
                            {userRSVP.payment_date && (
                              <span className="text-gray-600">• Paid on {format(new Date(userRSVP.payment_date), 'PP')}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {expandedEventAttendees === event.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-3">Attendees</h4>
                          <div className="space-y-2">
                            {event.event_attendees
                              ?.filter(a => a.status === 'yes')
                              .map((attendee) => (
                                <div key={attendee.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                                      {attendee.profile?.full_name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-gray-900 font-medium">{attendee.profile?.full_name || 'Unknown'}</span>
                                  </div>
                                  {event.is_paid && (
                                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                      attendee.payment_status === 'paid'
                                        ? 'bg-green-100 text-green-700'
                                        : attendee.payment_status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {attendee.payment_status === 'paid' ? '✅ Paid' : attendee.payment_status === 'pending' ? '⏳ Pending' : 'Free'}
                                    </span>
                                  )}
                                </div>
                              ))}
                            {event.event_attendees?.filter(a => a.status === 'yes').length === 0 && (
                              <p className="text-gray-500 text-sm">No confirmed attendees yet</p>
                            )}
                          </div>

                          {event.event_attendees?.filter(a => a.status === 'maybe').length > 0 && (
                            <>
                              <h4 className="font-semibold text-gray-700 mt-4 mb-2">Maybe Attending</h4>
                              <div className="space-y-2">
                                {event.event_attendees
                                  ?.filter(a => a.status === 'maybe')
                                  .map((attendee) => (
                                    <div key={attendee.id} className="flex items-center space-x-3 p-2 bg-white rounded-lg">
                                      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {attendee.profile?.full_name?.[0]?.toUpperCase() || 'U'}
                                      </div>
                                      <span className="text-gray-700 font-medium">{attendee.profile?.full_name || 'Unknown'}</span>
                                    </div>
                                  ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-adopteez-light/50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Calendar size={40} className="text-adopteez-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600">Create the first event for this group</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'stories' && (
        <div className="bg-white rounded-2xl shadow-sm p-8 mt-40">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('groups.familyStories')}</h2>
            <p className="text-gray-600 mt-2">{t('groups.storiesFromMembers')}</p>
          </div>
          {(() => {
            const isWorldwideGroup = !group?.residence_country;
            const storiesWithContent = familyStories.filter(story => {
              const content = isWorldwideGroup ? story.content_worldwide : story.content_local;
              return content && content.trim().length > 0;
            });

            return storiesWithContent.length > 0 ? (
              <div className="space-y-4">
                {storiesWithContent.map((story) => {
                  const storyContent = isWorldwideGroup ? story.content_worldwide : story.content_local;
                  const previewText = storyContent?.substring(0, 250) || '';
                  const needsReadMore = storyContent && storyContent.length > 250;

                  return (
                  <div
                    key={story.id}
                    className="border-2 border-adopteez-light/50 rounded-xl overflow-hidden hover:shadow-lg hover:border-adopteez-primary/30 transition-all bg-white"
                  >
                    <div className="flex flex-col md:flex-row gap-8">
                      <div
                        className="w-full md:w-80 h-64 md:h-80 bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer"
                        onClick={() => setSelectedStory(story)}
                      >
                        {story.image_url ? (
                          <img
                            src={story.image_url}
                            alt={story.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image failed to load:', story.image_url);
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-adopteez-light to-adopteez-primary/20 flex items-center justify-center">
                            <Users size={48} className="text-adopteez-primary/40" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-6 flex flex-col">
                        <div className="mb-3">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{story.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                            <span className="bg-adopteez-light/50 px-3 py-1 rounded-lg font-medium">
                              {isWorldwideGroup ? 'English' : (story.language === 'en' ? 'English' : story.language === 'da' ? 'Dansk' : story.language.toUpperCase())}
                            </span>
                            {story.profile?.city && (
                              <span className="flex items-center">
                                <MapPinIcon size={14} className="mr-1" />
                                {story.profile.city}
                              </span>
                            )}
                            {story.profile?.country && (
                              <span>{story.profile.country}</span>
                            )}
                            <span>{format(new Date(story.created_at), 'PPP')}</span>
                          </div>
                        </div>

                        {storyContent && (
                          <div className="flex-1">
                            <p className="text-gray-700 leading-relaxed line-clamp-6">
                              {previewText}{needsReadMore ? '...' : ''}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-4">
                          {story.family_story_members && story.family_story_members.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap flex-1">
                              <Users size={16} className="text-adopteez-primary" />
                              {story.family_story_members.slice(0, 3).map((member, idx) => {
                                const name = member.profiles?.full_name || member.children?.name || 'Unknown';
                                return (
                                  <span key={idx} className="bg-adopteez-primary/10 text-adopteez-dark px-3 py-1 rounded-lg text-sm font-medium">
                                    {name}
                                  </span>
                                );
                              })}
                              {story.family_story_members.length > 3 && (
                                <span className="text-sm text-gray-600">+{story.family_story_members.length - 3}</span>
                              )}
                            </div>
                          )}

                          {needsReadMore && (
                            <button
                              onClick={() => setSelectedStory(story)}
                              className="px-4 py-2 bg-adopteez-primary text-white font-semibold text-sm whitespace-nowrap hover:bg-adopteez-primary/90 rounded-lg transition-all"
                            >
                              {t('groups.readFullStory')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-adopteez-light/50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <BookOpen size={40} className="text-adopteez-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No family stories yet</h3>
                <p className="text-gray-600">Share your adoption journey with the group</p>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="bg-white rounded-2xl shadow-sm p-8 mt-40">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Photos</h2>
            <button className="px-6 py-3 bg-adopteez-primary text-white rounded-xl hover:bg-adopteez-dark transition-all font-semibold flex items-center space-x-2">
              <ImageIcon size={18} />
              <span>Upload Photo</span>
            </button>
          </div>
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="aspect-square bg-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                  <img src={photo.photo_url} alt={photo.caption || 'Group photo'} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-adopteez-light/50 rounded-full flex items-center justify-center mx-auto mb-5">
                <ImageIcon size={40} className="text-adopteez-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No photos yet</h3>
              <p className="text-gray-600">Upload photos to share with the group</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'childrens-map' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-40">
          <div className="p-8 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Children's Map</h2>
            <p className="text-gray-600">Explore where all the adopted children in our group are currently living</p>
          </div>
          <div className="relative rounded-lg overflow-hidden border border-gray-200" style={{ height: '600px', width: '100%' }}>
            <Map
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              mapLib={import('maplibre-gl')}
              mapStyle={{
                version: 8,
                sources: {
                  'osm-tiles': {
                    type: 'raster',
                    tiles: [
                      'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                    ],
                    tileSize: 256,
                    attribution: '© OpenStreetMap contributors'
                  }
                },
                layers: [
                  {
                    id: 'osm-tiles',
                    type: 'raster',
                    source: 'osm-tiles',
                    minzoom: 0,
                    maxzoom: 19
                  }
                ]
              }}
              style={{ width: '100%', height: '100%' }}
            >
              {children.map((child) => {
                if (!child.current_city) return null;

                const isWorldwide = !group?.residence_country;
                const coordinates = getCityCoordinates(child.current_city, isWorldwide);
                if (!coordinates) return null;

                return (
                  <Marker
                    key={child.id}
                    longitude={coordinates[0]}
                    latitude={coordinates[1]}
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      setSelectedChild(child);
                    }}
                  >
                    <div className="relative cursor-pointer transform hover:scale-110 transition-transform">
                      <div className="w-8 h-8 bg-adopteez-primary rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                        <MapPinIcon size={20} className="text-white" />
                      </div>
                    </div>
                  </Marker>
                );
              })}

              {selectedChild && getCityCoordinates(selectedChild.current_city, !group?.residence_country) && (
                <Popup
                  longitude={getCityCoordinates(selectedChild.current_city, !group?.residence_country)[0]}
                  latitude={getCityCoordinates(selectedChild.current_city, !group?.residence_country)[1]}
                  onClose={() => setSelectedChild(null)}
                  closeButton={true}
                  closeOnClick={false}
                  anchor="bottom"
                  offset={25}
                >
                  <div className="p-4">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{selectedChild.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 flex items-center">
                      <MapPinIcon size={14} className="mr-1" />
                      {selectedChild.current_city}
                    </p>
                    {selectedChild.profile && (
                      <p className="text-sm text-gray-700">
                        Family: {selectedChild.profile.full_name}
                      </p>
                    )}
                  </div>
                </Popup>
              )}
            </Map>
          </div>
          {children.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-adopteez-light/50 rounded-full flex items-center justify-center mx-auto mb-5">
                <MapPinIcon size={40} className="text-adopteez-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No children locations yet</h3>
              <p className="text-gray-600">Members need to add children with their current city to see them on the map</p>
            </div>
          )}
        </div>
      )}

      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Create Event</h2>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                    placeholder="e.g., Annual Taiwan Adoptee Reunion"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent resize-none"
                    rows="4"
                    placeholder="Tell members about the event..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Event Type *
                    </label>
                    <select
                      value={eventForm.event_type}
                      onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                    >
                      <option value="physical">Physical Meeting</option>
                      <option value="online">Online Meeting</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={eventForm.timezone}
                      onChange={(e) => setEventForm({ ...eventForm, timezone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                    >
                      <option value="Europe/Copenhagen">Europe/Copenhagen (CET)</option>
                      <option value="Europe/Stockholm">Europe/Stockholm (CET)</option>
                      <option value="Europe/Oslo">Europe/Oslo (CET)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                      <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                    placeholder="e.g., Copenhagen City Hall, Room 301"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Searchable Location (City/Country)
                  </label>
                  <input
                    type="text"
                    value={eventForm.location_searchable}
                    onChange={(e) => setEventForm({ ...eventForm, location_searchable: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                    placeholder="e.g., Copenhagen, Denmark"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={eventForm.start_date}
                      onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={eventForm.start_time}
                      onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={eventForm.end_time}
                      onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    RSVP Deadline
                  </label>
                  <input
                    type="date"
                    value={eventForm.deadline_rsvp}
                    onChange={(e) => setEventForm({ ...eventForm, deadline_rsvp: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price (leave empty if free)
                    </label>
                    <input
                      type="number"
                      value={eventForm.price}
                      onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={eventForm.currency}
                      onChange={(e) => setEventForm({ ...eventForm, currency: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                    >
                      <option value="DKK">DKK (Danish Krone)</option>
                      <option value="SEK">SEK (Swedish Krona)</option>
                      <option value="NOK">NOK (Norwegian Krone)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="GBP">GBP (British Pound)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  disabled={!eventForm.title.trim() || !eventForm.start_date}
                  className="flex-1 px-6 py-3 bg-adopteez-primary text-white rounded-xl hover:bg-adopteez-dark transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'discussions' && (
        <div className="space-y-6 mt-40">
          <div className="bg-gray-50 rounded-2xl shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Debat</h2>
              <button
                onClick={() => setShowDiscussionModal(true)}
                className="px-8 py-3.5 bg-adopteez-primary text-white rounded-xl hover:bg-adopteez-dark transition-all font-semibold flex items-center space-x-2.5 text-base shadow-md hover:shadow-lg"
              >
                <MessageCircleMore size={20} />
                <span>{t('groupDetail.startDiscussion')}</span>
              </button>
            </div>

            {discussions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageCircleMore size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Ingen debatter endnu</p>
                <p className="text-sm mt-2">Vær den første til at starte en debat!</p>
              </div>
            ) : (
              <div>
                {discussions.map((discussion, index) => (
                  <div key={discussion.id} className={`border-2 border-gray-300 rounded-xl p-10 hover:border-adopteez-primary transition-colors shadow-lg bg-white mb-16 ${index > 0 ? 'mt-8' : ''}`}>
                    <div className="flex items-center space-x-10 mb-8">
                      <div className="flex flex-col items-center w-24 flex-shrink-0">
                        {discussion.author?.avatar_url ? (
                          <img src={discussion.author.avatar_url} alt={discussion.author.full_name} className="w-20 h-20 rounded-full object-cover" />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold text-2xl">
                            {discussion.author?.full_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-bold text-lg text-gray-900">{discussion.title}</h3>
                              {discussion.pinned && (
                                <Pin size={18} className="text-adopteez-primary fill-adopteez-primary" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              af {discussion.author?.full_name || 'Unknown'} • {format(new Date(discussion.created_at), 'dd MMM yyyy, HH:mm')}
                            </p>
                          </div>
                          {isGroupAdmin && (
                            <button
                              onClick={() => handlePinDiscussion(discussion.id, discussion.pinned)}
                              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                                discussion.pinned
                                  ? 'bg-adopteez-primary text-white hover:bg-adopteez-dark'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              title={discussion.pinned ? t('groupDetail.unpin') : t('groupDetail.pin')}
                            >
                              <Pin size={16} className={discussion.pinned ? 'fill-white' : ''} />
                              <span className="text-sm">{discussion.pinned ? t('groupDetail.unpin') : t('groupDetail.pin')}</span>
                            </button>
                          )}
                        </div>
                        <p className="text-gray-700 mb-6">{discussion.content}</p>

                        <div className="border-t border-gray-200 pt-6 mt-6">
                          <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
                            <MessageCircle size={16} />
                            <span>{discussion.discussion_replies?.length || 0} svar</span>
                          </div>

                          {discussion.discussion_replies && discussion.discussion_replies.length > 0 && (
                            <div className="space-y-3 mb-4">
                              {discussion.discussion_replies.map((reply) => (
                                <div key={reply.id} className="flex items-start space-x-3 pl-4 border-l-2 border-gray-200">
                                  {reply.author?.avatar_url ? (
                                    <img src={reply.author.avatar_url} alt={reply.author.full_name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                  ) : (
                                    <div className="w-8 h-8 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                      {reply.author?.full_name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {reply.author?.full_name || 'Unknown'}
                                    </p>
                                    <p className="text-sm text-gray-700">{reply.content}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {format(new Date(reply.created_at), 'dd MMM yyyy, HH:mm')}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex space-x-3">
                            <input
                              type="text"
                              value={newReply[discussion.id] || ''}
                              onChange={(e) => setNewReply({ ...newReply, [discussion.id]: e.target.value })}
                              placeholder="Skriv et svar..."
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddReply(discussion.id);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleAddReply(discussion.id)}
                              disabled={!newReply[discussion.id]?.trim()}
                              className="px-5 py-2.5 bg-adopteez-primary text-white rounded-lg hover:bg-adopteez-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm font-medium shadow-sm hover:shadow-md"
                            >
                              <Send size={18} />
                              <span>{t('groupDetail.reply')}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-white rounded-2xl shadow-sm p-8 mt-40">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Group</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {group?.description || 'No description available for this group.'}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Administrators</h3>

              {members.filter(m => m.is_admin).length > 0 ? (
                <div className="space-y-3">
                  {members.filter(m => m.is_admin).map((admin) => (
                    <div key={admin.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                      {admin.profile?.avatar_url ? (
                        <img src={admin.profile.avatar_url} alt={admin.profile.full_name} className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {admin.profile?.full_name?.[0]?.toUpperCase() || 'A'}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{admin.profile?.full_name || 'Unknown Admin'}</p>
                        <p className="text-sm text-gray-600">Group Administrator</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-600 mb-4">This group currently has no administrators.</p>
                  {isMember && !isGroupAdmin && !adminRequests.find(r => r.user_id === user.id) && (
                    <button
                      onClick={async () => {
                        try {
                          const { data: requestData, error } = await supabase
                            .from('admin_requests')
                            .insert([{
                              group_id: groupId,
                              user_id: user.id,
                              status: 'pending'
                            }])
                            .select()
                            .single();

                          if (error) {
                            console.error('Error applying as admin:', error);
                            if (error.code === '23505') {
                              alert('You already have a pending admin request for this group.');
                            } else if (error.code === '42501' || error.message?.includes('policy')) {
                              alert('You cannot apply to be admin. You might already be an admin or not a member of this group.');
                            } else {
                              alert('Failed to submit request: ' + error.message);
                            }
                            return;
                          }

                          const { error: postError } = await supabase
                            .from('posts')
                            .insert([{
                              group_id: groupId,
                              author_id: null,
                              is_system_post: true,
                              system_author_name: 'Adopteez',
                              system_author_avatar: '/Adopteez uB-Photoroom.png',
                              admin_request_id: requestData.id,
                              content: `${profile?.full_name || 'A member'} has requested to become a group administrator. Members can show support or raise objections below. If fewer than 2 members object within 24 hours, they will automatically become an administrator.`
                            }]);

                          if (postError) {
                            console.error('Error creating announcement post:', postError);
                          }

                          alert('You have requested to become a group administrator, thank you. We have now sent this to the group and if no more than 2 people object within the next 24 hours, you will become the group administrator.');
                          fetchAdminRequests();
                          fetchPosts();
                        } catch (error) {
                          console.error('Error applying as admin:', error);
                          alert('Failed to submit request. Please try again.');
                        }
                      }}
                      className="px-6 py-3 bg-adopteez-primary text-white rounded-xl hover:bg-adopteez-dark transition-all font-semibold"
                    >
                      Request to Become Administrator
                    </button>
                  )}
                </div>
              )}

              {(() => {
                console.log('Rendering admin requests, count:', adminRequests.length, 'data:', adminRequests);
                return null;
              })()}

              {adminRequests.length > 0 && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Administrator Request - 24 Hour Voting Period</h3>
                  <div className="space-y-4">
                    {adminRequests.map((request) => {
                      const objectionCount = request.objection_count || 0;
                      const hasObjected = userObjections[request.id];
                      const isOwnRequest = request.user_id === user.id;

                      return (
                        <div key={request.id} className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl shadow-sm">
                          <div className="flex items-start space-x-4">
                            {request.profile?.avatar_url ? (
                              <img src={request.profile.avatar_url} alt={request.profile.full_name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-white">
                                {request.profile?.full_name?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-lg font-bold text-gray-900 mb-1">
                                {isOwnRequest ? 'You have' : `${request.profile?.full_name || 'A member has'}`} requested to become a group administrator
                              </p>
                              <p className="text-sm text-gray-600 mb-3">
                                Posted {format(new Date(request.created_at), 'PPp')} • Will be decided in 24 hours
                              </p>

                              <div className="bg-white/70 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {isOwnRequest
                                    ? "Your request is now visible to all group members. We're waiting 24 hours to see if anyone has objections."
                                    : "This person wants to volunteer their time to help manage this group. If you have concerns, you can object anonymously. Otherwise, you can show your support by commenting below!"
                                  }
                                </p>
                              </div>

                              <div className="flex items-center space-x-4 mb-4">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-semibold text-gray-700">
                                    {objectionCount} {objectionCount === 1 ? 'Objection' : 'Objections'}
                                  </span>
                                  {objectionCount >= 2 && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                      Will be rejected
                                    </span>
                                  )}
                                </div>
                              </div>

                              {!isOwnRequest && (
                                <div className="flex items-center space-x-3">
                                  {!hasObjected ? (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const { error } = await supabase
                                            .from('admin_request_objections')
                                            .insert([{
                                              request_id: request.id,
                                              user_id: user.id
                                            }]);

                                          if (error) throw error;

                                          alert('Your objection has been recorded anonymously. Two objections from different members will reject this request.');
                                          fetchAdminRequests();
                                        } catch (error) {
                                          console.error('Error objecting:', error);
                                          alert('Failed to record objection. Please try again.');
                                        }
                                      }}
                                      className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-all shadow-sm"
                                    >
                                      ✋ Object (Anonymous)
                                    </button>
                                  ) : (
                                    <span className="px-5 py-2.5 bg-red-100 text-red-700 text-sm font-semibold rounded-lg">
                                      ✋ You objected
                                    </span>
                                  )}
                                  <button
                                    onClick={() => {
                                      const comment = prompt("Write a supportive comment to encourage this volunteer (visible to everyone):");
                                      if (comment) {
                                        alert('Comments feature coming soon! Your support is appreciated.');
                                      }
                                    }}
                                    className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-all shadow-sm"
                                  >
                                    👍 Support & Comment
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <DiscussionModal
        isOpen={showDiscussionModal}
        onClose={() => setShowDiscussionModal(false)}
        onSubmit={handleCreateDiscussion}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setReportTarget(null);
          setReportType(null);
        }}
        onSubmit={handleSubmitReport}
        type={reportType}
        targetName={reportType === 'member' ? reportTarget?.name : ''}
      />

      <PartnerGroupAccessModal
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        onSubmit={handlePartnerGroupAccess}
        group={group}
      />

      {selectedStory && (
        <FamilyStoryModal
          story={selectedStory}
          isWorldwideGroup={!group?.residence_country}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
}
