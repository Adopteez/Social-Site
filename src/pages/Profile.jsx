import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Edit, Plus, MapPin, Calendar, Camera, Users, User, Image as ImageIcon, BookOpen, X, Search, UserPlus, MessageCircle, Upload, Trash2, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import ChildFormModal from '../components/ChildFormModal';
import MembershipStatus from '../components/MembershipStatus';
import FamilyTree from '../components/FamilyTree';
import FeatureGate from '../components/FeatureGate';

const getRelationToAdoptionLabel = (value) => {
  const labels = {
    'adoptee': 'Adoptee',
    'adoptive_parent': 'Forældre Adoptiv',
    'biological_family': 'Biological Family',
    'supporter': 'Supporter'
  };
  return labels[value] || value;
};

export default function Profile() {
  const { t } = useTranslation();
  const { profile, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [children, setChildren] = useState([]);
  const [familyStories, setFamilyStories] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [showChildModal, setShowChildModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [editingStory, setEditingStory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [taggedMembers, setTaggedMembers] = useState([]);
  const [taggedChildren, setTaggedChildren] = useState([]);
  const [childFormData, setChildFormData] = useState({
    name: '',
    birth_name: '',
    birth_date: '',
    current_city: '',
    birth_city: '',
    birth_mother: '',
    birth_father: '',
    orphanage_name: '',
    facebook_profile: '',
    image_url: '',
    name_visibility: 'public',
    birth_name_visibility: 'hidden',
    birth_date_visibility: 'group',
    current_city_visibility: 'public',
    birth_city_visibility: 'group',
    birth_mother_visibility: 'hidden',
    birth_father_visibility: 'hidden',
    orphanage_name_visibility: 'hidden',
    facebook_profile_visibility: 'group',
  });
  const [storyFormData, setStoryFormData] = useState({
    family_name: '',
    story_local: '',
    story_worldwide: '',
    city: '',
    country: '',
    language: 'en',
    image_url: '',
  });
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    relation_to_adoption: '',
    education: '',
    job: '',
    relationship_status: '',
    birth_date: '',
    linked_children: [],
    language: 'en',
    full_name_visibility: 'public',
    bio_visibility: 'public',
    relation_to_adoption_visibility: 'public',
    education_visibility: 'public',
    job_visibility: 'public',
    relationship_status_visibility: 'public',
    birth_date_visibility: 'group',
    linked_children_visibility: 'public',
  });
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [childSearchQuery, setChildSearchQuery] = useState('');
  const [childSearchResults, setChildSearchResults] = useState([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingStoryImage, setUploadingStoryImage] = useState(false);
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [showPostComposer, setShowPostComposer] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState('');
  const [postVideoUrl, setPostVideoUrl] = useState('');
  const [uploadingPostImage, setUploadingPostImage] = useState(false);
  const [posts, setPosts] = useState([]);
  const postImageInputRef = useRef(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        relation_to_adoption: profile.relation_to_adoption || '',
        education: profile.education || '',
        job: profile.job || '',
        relationship_status: profile.relationship_status || '',
        birth_date: profile.birth_date || '',
        linked_children: profile.linked_children || [],
        language: profile.language || 'en',
        full_name_visibility: profile.full_name_visibility || 'public',
        bio_visibility: profile.bio_visibility || 'public',
        relation_to_adoption_visibility: profile.relation_to_adoption_visibility || 'public',
        education_visibility: profile.education_visibility || 'public',
        job_visibility: profile.job_visibility || 'public',
        relationship_status_visibility: profile.relationship_status_visibility || 'public',
        birth_date_visibility: profile.birth_date_visibility || 'group',
        linked_children_visibility: profile.linked_children_visibility || 'public',
      });
      fetchChildren();
      fetchFamilyStories();
      fetchMyEvents();
      fetchPosts();
      fetchTickets();
    }
  }, [profile]);

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchFamilyStories = async () => {
    try {
      const { data: ownStories, error: ownError } = await supabase
        .from('family_stories')
        .select(`
          *,
          profiles(id, full_name, avatar_url),
          family_story_members(
            profile_id,
            child_id,
            profiles(id, full_name, avatar_url),
            children(id, name, image_url)
          )
        `)
        .eq('profile_id', profile.id)
        .is('group_id', null)
        .order('created_at', { ascending: false });

      if (ownError) throw ownError;

      const { data: taggedStories, error: taggedError } = await supabase
        .from('family_story_members')
        .select(`
          family_stories!inner(
            *,
            profiles(id, full_name, avatar_url),
            family_story_members(
              profile_id,
              child_id,
              profiles(id, full_name, avatar_url),
              children(id, name, image_url)
            )
          )
        `)
        .eq('profile_id', profile.id)
        .is('family_stories.group_id', null);

      if (taggedError) throw taggedError;

      const tagged = taggedStories?.map(item => item.family_stories).filter(Boolean) || [];
      const allStories = [...(ownStories || []), ...tagged];
      const uniqueStories = allStories.filter((story, index, self) =>
        index === self.findIndex(s => s.id === story.id)
      );

      setFamilyStories(uniqueStories.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      ));
    } catch (error) {
      console.error('Error fetching family stories:', error);
    }
  };

  const fetchMyEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          *,
          events!inner(
            *,
            groups(id, name),
            organizer:profiles!events_organizer_id_fkey(full_name)
          )
        `)
        .eq('profile_id', profile.id)
        .eq('status', 'yes')
        .order('registered_at', { ascending: false });

      if (error) throw error;

      const eventsData = data?.map(item => ({
        ...item.events,
        rsvp_status: item.status
      })) || [];

      setMyEvents(eventsData.sort((a, b) =>
        new Date(a.start_date) - new Date(b.start_date)
      ));
    } catch (error) {
      console.error('Error fetching my events:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, full_name, avatar_url)
        `)
        .eq('author_id', profile.id)
        .is('group_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback_tickets')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handlePostImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPostImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploadingPostImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `post-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      setPostImage(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setPostImagePreview('');
    } finally {
      setUploadingPostImage(false);
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

  const handleCreatePost = async () => {
    if (!postContent.trim() && !postImage && !postVideoUrl.trim()) return;

    try {
      const videoEmbed = getYouTubeEmbedUrl(postVideoUrl);

      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            author_id: profile.id,
            content: postContent,
            image_url: postImage,
            video_url: videoEmbed,
            group_id: null
          }
        ])
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setPosts([data, ...posts]);
      setPostContent('');
      setPostImage(null);
      setPostImagePreview('');
      setPostVideoUrl('');
      setShowPostComposer(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const searchProfiles = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .neq('id', profile.id)
        .ilike('full_name', `%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching profiles:', error);
    }
  };

  const addTaggedMember = (member) => {
    if (!taggedMembers.find(m => m.id === member.id)) {
      setTaggedMembers([...taggedMembers, member]);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const searchChildProfiles = async (query) => {
    if (!query.trim()) {
      setChildSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .neq('id', profile.id)
        .ilike('full_name', `%${query}%`)
        .limit(10);

      if (error) throw error;
      setChildSearchResults(data || []);
    } catch (error) {
      console.error('Error searching child profiles:', error);
    }
  };

  const addLinkedChild = (child) => {
    const currentChildren = Array.isArray(formData.linked_children) ? formData.linked_children : [];
    if (!currentChildren.find(c => c.id === child.id)) {
      setFormData({
        ...formData,
        linked_children: [...currentChildren, { id: child.id, full_name: child.full_name }]
      });
      setChildSearchQuery('');
      setChildSearchResults([]);
    }
  };

  const removeLinkedChild = (childId) => {
    const currentChildren = Array.isArray(formData.linked_children) ? formData.linked_children : [];
    setFormData({
      ...formData,
      linked_children: currentChildren.filter(c => c.id !== childId)
    });
  };

  const removeTaggedMember = (memberId) => {
    setTaggedMembers(taggedMembers.filter(m => m.id !== memberId));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB');
      return;
    }

    setUploadingBanner(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-banner-${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      await updateProfile({ banner_url: publicUrl });
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Failed to upload banner. Please try again.');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleStoryImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vælg venligst et billede');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Billedet må max være 5MB');
      return;
    }

    setUploadingStoryImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `family-story-${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `family-stories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      setStoryFormData({ ...storyFormData, image_url: publicUrl });
    } catch (error) {
      console.error('Error uploading story image:', error);
      alert('Fejl ved upload af billede');
    } finally {
      setUploadingStoryImage(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setEditing(false);
      setIsEditingIntro(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAddChild = async () => {
    try {
      if (editingChild) {
        const { error } = await supabase
          .from('children')
          .update(childFormData)
          .eq('id', editingChild.id);

        if (error) throw error;

        setChildren(children.map(c => c.id === editingChild.id ? { ...c, ...childFormData } : c));
      } else {
        const { data, error } = await supabase
          .from('children')
          .insert([
            {
              profile_id: profile.id,
              ...childFormData,
            },
          ])
          .select();

        if (error) throw error;
        setChildren([...children, data[0]]);
      }

      setShowChildModal(false);
      setEditingChild(null);
      setChildFormData({
        name: '',
        birth_name: '',
        birth_date: '',
        current_city: '',
        birth_city: '',
        birth_mother: '',
        birth_father: '',
        orphanage_name: '',
        facebook_profile: '',
        image_url: '',
        name_visibility: 'public',
        birth_name_visibility: 'hidden',
        birth_date_visibility: 'group',
        current_city_visibility: 'public',
        birth_city_visibility: 'group',
        birth_mother_visibility: 'hidden',
        birth_father_visibility: 'hidden',
        orphanage_name_visibility: 'hidden',
        facebook_profile_visibility: 'group',
      });
    } catch (error) {
      console.error('Error saving child:', error);
      alert('Failed to save child. Please try again.');
    }
  };

  const handleEditChild = (child) => {
    setEditingChild(child);
    setChildFormData({
      name: child.name || '',
      birth_name: child.birth_name || '',
      birth_date: child.birth_date || '',
      current_city: child.current_city || '',
      birth_city: child.birth_city || '',
      birth_mother: child.birth_mother || '',
      birth_father: child.birth_father || '',
      orphanage_name: child.orphanage_name || '',
      facebook_profile: child.facebook_profile || '',
      image_url: child.image_url || '',
      name_visibility: child.name_visibility || 'public',
      birth_name_visibility: child.birth_name_visibility || 'hidden',
      birth_date_visibility: child.birth_date_visibility || 'group',
      current_city_visibility: child.current_city_visibility || 'public',
      birth_city_visibility: child.birth_city_visibility || 'group',
      birth_mother_visibility: child.birth_mother_visibility || 'hidden',
      birth_father_visibility: child.birth_father_visibility || 'hidden',
      orphanage_name_visibility: child.orphanage_name_visibility || 'hidden',
      facebook_profile_visibility: child.facebook_profile_visibility || 'group',
    });
    setShowChildModal(true);
  };

  const handleAddFamilyStory = async () => {
    if (!storyFormData.family_name.trim()) {
      alert('Please fill in family name');
      return;
    }

    if (!storyFormData.story_local.trim() && !storyFormData.story_worldwide.trim()) {
      alert('Please fill in at least one story (local or worldwide)');
      return;
    }

    try {
      const { data: userGroupSubs, error: groupsError } = await supabase
        .from('group_subscriptions')
        .select(`
          group_id,
          groups(id, name, residence_country)
        `)
        .eq('profile_id', profile.id);

      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        throw groupsError;
      }

      console.log('User group subscriptions:', userGroupSubs);

      const { data: storyData, error: storyError } = await supabase
        .from('family_stories')
        .insert([
          {
            profile_id: profile.id,
            group_id: null,
            title: storyFormData.family_name,
            content_local: storyFormData.story_local.trim() || null,
            content_worldwide: storyFormData.story_worldwide.trim() || null,
            city: storyFormData.city || null,
            country: storyFormData.country || null,
            language: storyFormData.language,
            image_url: storyFormData.image_url || null,
          },
        ])
        .select()
        .single();

      if (storyError) throw storyError;

      if (taggedMembers.length > 0 || taggedChildren.length > 0) {
        const memberInserts = [
          ...taggedMembers.map(member => ({
            family_story_id: storyData.id,
            profile_id: member.id,
            child_id: null,
          })),
          ...taggedChildren.map(child => ({
            family_story_id: storyData.id,
            profile_id: null,
            child_id: child.id,
          })),
        ];

        const { error: membersError } = await supabase
          .from('family_story_members')
          .insert(memberInserts);

        if (membersError) throw membersError;
      }

      if (userGroupSubs && userGroupSubs.length > 0) {
        const groupStories = [];
        const hasLocalContent = storyFormData.story_local.trim().length > 0;
        const hasWorldwideContent = storyFormData.story_worldwide.trim().length > 0;

        console.log('Has local content:', hasLocalContent);
        console.log('Has worldwide content:', hasWorldwideContent);

        for (const sub of userGroupSubs) {
          const isWorldwideGroup = !sub.groups?.residence_country;
          console.log(`Group ${sub.groups?.name}: isWorldwide=${isWorldwideGroup}, residence_country=${sub.groups?.residence_country}`);

          if ((isWorldwideGroup && hasWorldwideContent) || (!isWorldwideGroup && hasLocalContent)) {
            console.log(`Adding story to group ${sub.groups?.name}`);
            groupStories.push({
              profile_id: profile.id,
              group_id: sub.group_id,
              title: storyFormData.family_name,
              content_local: storyFormData.story_local.trim() || null,
              content_worldwide: storyFormData.story_worldwide.trim() || null,
              city: storyFormData.city || null,
              country: storyFormData.country || null,
              language: storyFormData.language,
              image_url: storyFormData.image_url || null,
            });
          } else {
            console.log(`Skipping group ${sub.groups?.name} - no matching content`);
          }
        }

        console.log('Stories to insert into groups:', groupStories.length);

        if (groupStories.length > 0) {
          const groupStoriesWithSource = groupStories.map(story => ({
            ...story,
            source_story_id: storyData.id
          }));

          const { data: insertedStories, error: groupStoriesError } = await supabase
            .from('family_stories')
            .insert(groupStoriesWithSource)
            .select();

          if (groupStoriesError) {
            console.error('Error posting to groups:', groupStoriesError);
          } else {
            console.log('Successfully inserted stories into groups:', insertedStories);
          }
        } else {
          console.log('No stories to insert - check if content matches group types');
        }
      } else {
        console.log('User is not a member of any groups');
      }

      await fetchFamilyStories();
      setShowStoryModal(false);
      setStoryFormData({
        family_name: '',
        story_local: '',
        story_worldwide: '',
        city: '',
        country: '',
        language: 'en',
        image_url: '',
      });
      setTaggedMembers([]);
      setTaggedChildren([]);
    } catch (error) {
      console.error('Error adding family story:', error);
      alert('Failed to add family story. Please try again.');
    }
  };

  const handleEditStory = (story) => {
    setEditingStory(story);
    setStoryFormData({
      family_name: story.title || '',
      story_local: story.content_local || '',
      story_worldwide: story.content_worldwide || '',
      city: story.city || '',
      country: story.country || '',
      language: story.language || 'en',
      image_url: story.image_url || '',
    });
    if (story.family_story_members && story.family_story_members.length > 0) {
      const members = story.family_story_members
        .filter(m => m.profile_id)
        .map(m => m.profiles)
        .filter(Boolean);
      setTaggedMembers(members);

      const taggedKids = story.family_story_members
        .filter(m => m.child_id)
        .map(m => m.children)
        .filter(Boolean);
      setTaggedChildren(taggedKids);
    }
    setShowStoryModal(true);
  };

  const handleUpdateFamilyStory = async () => {
    if (!storyFormData.family_name.trim()) {
      alert('Please fill in family name');
      return;
    }

    if (!storyFormData.story_local.trim() && !storyFormData.story_worldwide.trim()) {
      alert('Please fill in at least one story (local or worldwide)');
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('family_stories')
        .update({
          title: storyFormData.family_name,
          content_local: storyFormData.story_local.trim() || null,
          content_worldwide: storyFormData.story_worldwide.trim() || null,
          city: storyFormData.city || null,
          country: storyFormData.country || null,
          language: storyFormData.language,
          image_url: storyFormData.image_url || null,
        })
        .eq('id', editingStory.id);

      if (updateError) throw updateError;

      const { error: deleteMembersError } = await supabase
        .from('family_story_members')
        .delete()
        .eq('family_story_id', editingStory.id);

      if (deleteMembersError) throw deleteMembersError;

      if (taggedMembers.length > 0 || taggedChildren.length > 0) {
        const memberInserts = [
          ...taggedMembers.map(member => ({
            family_story_id: editingStory.id,
            profile_id: member.id,
            child_id: null,
          })),
          ...taggedChildren.map(child => ({
            family_story_id: editingStory.id,
            profile_id: null,
            child_id: child.id,
          })),
        ];

        const { error: membersError } = await supabase
          .from('family_story_members')
          .insert(memberInserts);

        if (membersError) throw membersError;
      }

      const { error: groupStoriesError } = await supabase
        .from('family_stories')
        .update({
          title: storyFormData.family_name,
          content_local: storyFormData.story_local.trim() || null,
          content_worldwide: storyFormData.story_worldwide.trim() || null,
          city: storyFormData.city || null,
          country: storyFormData.country || null,
          language: storyFormData.language,
          image_url: storyFormData.image_url || null,
        })
        .eq('source_story_id', editingStory.id);

      if (groupStoriesError) {
        console.error('Error updating group stories:', groupStoriesError);
      }

      await fetchFamilyStories();
      setShowStoryModal(false);
      setEditingStory(null);
      setStoryFormData({
        family_name: '',
        story_local: '',
        story_worldwide: '',
        city: '',
        country: '',
        language: 'en',
        image_url: '',
      });
      setTaggedMembers([]);
      setTaggedChildren([]);
    } catch (error) {
      console.error('Error updating family story:', error);
      alert('Failed to update family story. Please try again.');
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!confirm('Er du sikker på at du vil slette denne familiehistorie? Dette vil også slette den fra alle grupper.')) {
      return;
    }

    try {
      const { error: deleteMembersError } = await supabase
        .from('family_story_members')
        .delete()
        .eq('family_story_id', storyId);

      if (deleteMembersError) throw deleteMembersError;

      const { error: deleteError } = await supabase
        .from('family_stories')
        .delete()
        .eq('id', storyId);

      if (deleteError) throw deleteError;

      await fetchFamilyStories();
    } catch (error) {
      console.error('Error deleting family story:', error);
      alert('Fejl ved sletning af familiehistorie');
    }
  };

  const handleSaveFamilyStory = () => {
    if (editingStory) {
      handleUpdateFamilyStory();
    } else {
      handleAddFamilyStory();
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        onChange={handleBannerUpload}
        className="hidden"
      />
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="h-80 relative group">
          {profile?.banner_url ? (
            <img src={profile.banner_url} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="h-full bg-gradient-to-br from-adopteez-primary to-adopteez-accent relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-white text-8xl font-bold mb-4">Adopteez</div>
                  <div className="text-white/80 text-2xl">{t('profile.connectShareSupport')}</div>
                </div>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all"></div>
          <button
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploadingBanner}
            className="absolute bottom-6 right-6 bg-white px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2 hover:bg-gray-50 transition-all shadow-lg opacity-0 group-hover:opacity-100 disabled:opacity-50"
          >
            <Camera size={18} />
            <span>{uploadingBanner ? t('profile.uploading') : t('profile.editCoverPhoto')}</span>
          </button>
        </div>
        <div className="px-8 pb-6">
          <div className="flex items-end justify-between -mt-24 mb-6">
            <div className="flex items-end space-x-5">
              <div className="relative group/avatar">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-48 h-48 rounded-full border-[6px] border-white shadow-2xl object-cover"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gradient-to-br from-adopteez-primary via-adopteez-secondary to-adopteez-accent rounded-full border-[6px] border-white shadow-2xl flex items-center justify-center text-white text-6xl font-bold">
                    {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-3 right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-all shadow-xl opacity-0 group-hover/avatar:opacity-100 border-2 border-gray-100 disabled:opacity-50"
                >
                  <Camera size={20} />
                </button>
              </div>
              <div className="pb-4">
                <h1 className="text-7xl font-bold text-gray-900 mb-1">{profile?.full_name}</h1>
                <p className="text-gray-600 text-lg">234 {t('profile.friends')}</p>
              </div>
            </div>
            <button
              onClick={() => (editing ? handleSave() : setEditing(true))}
              className="mb-4 px-8 py-3 bg-adopteez-light/50 text-adopteez-dark rounded-xl hover:bg-adopteez-light transition-all flex items-center space-x-2 font-semibold shadow-sm border border-adopteez-primary/20"
            >
              <Edit size={18} />
              <span>{editing ? t('common.save') : t('profile.editProfile')}</span>
            </button>
          </div>

          <div className="border-t border-gray-200 pt-12 pb-12 mb-8 flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-8 py-5 text-lg font-semibold rounded-2xl transition-all ${
                activeTab === 'posts'
                  ? 'text-adopteez-dark bg-adopteez-light shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-gray-50 hover:scale-102'
              }`}
            >
              {t('profile.posts')}
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-8 py-5 text-lg font-semibold rounded-2xl transition-all ${
                activeTab === 'about'
                  ? 'text-adopteez-dark bg-adopteez-light shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-gray-50 hover:scale-102'
              }`}
            >
              {t('profile.about')}
            </button>
            <button
              onClick={() => setActiveTab('children')}
              className={`px-8 py-5 text-lg font-semibold rounded-2xl transition-all ${
                activeTab === 'children'
                  ? 'text-adopteez-dark bg-adopteez-light shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-gray-50 hover:scale-102'
              }`}
            >
              {t('profile.children')}
            </button>
            <button
              onClick={() => setActiveTab('family-stories')}
              className={`px-8 py-5 text-lg font-semibold rounded-2xl transition-all ${
                activeTab === 'family-stories'
                  ? 'text-adopteez-dark bg-adopteez-light shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-gray-50 hover:scale-102'
              }`}
            >
              {t('profile.familyStories')}
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-8 py-5 text-lg font-semibold rounded-2xl transition-all ${
                activeTab === 'photos'
                  ? 'text-adopteez-dark bg-adopteez-light shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-gray-50 hover:scale-102'
              }`}
            >
              {t('profile.photos')}
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-8 py-5 text-lg font-semibold rounded-2xl transition-all ${
                activeTab === 'calendar'
                  ? 'text-adopteez-dark bg-adopteez-light shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-gray-50 hover:scale-102'
              }`}
            >
              {t('profile.myCalendar')}
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-8 py-5 text-lg font-semibold rounded-2xl transition-all ${
                activeTab === 'tickets'
                  ? 'text-adopteez-dark bg-adopteez-light shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-gray-50 hover:scale-102'
              }`}
            >
              {t('profile.myTickets')}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-16 max-w-5xl mx-auto px-6">
        <main className="space-y-8">
          {activeTab === 'posts' && (
            <>
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-adopteez-light/50 rounded-full flex items-center justify-center flex-shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <Users size={24} className="text-adopteez-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      onFocus={() => setShowPostComposer(true)}
                      className="w-full px-4 py-3 bg-gray-50 rounded-full focus:outline-none focus:ring-2 focus:ring-adopteez-primary"
                      placeholder={`What's on your mind, ${profile?.full_name?.split(' ')[0] || 'there'}?`}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      ref={postImageInputRef}
                      onChange={handlePostImageSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => postImageInputRef.current?.click()}
                      disabled={uploadingPostImage}
                      className="p-3 text-green-600 hover:bg-gray-100 rounded-full transition-all"
                      title="Add photo"
                    >
                      <Camera size={24} />
                    </button>
                    <button
                      onClick={handleCreatePost}
                      disabled={(!postContent.trim() && !postImage && !postVideoUrl.trim()) || uploadingPostImage}
                      className="px-6 py-3 bg-adopteez-primary text-white rounded-full hover:bg-adopteez-dark transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('profile.post')}
                    </button>
                  </div>
                </div>

                {showPostComposer && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-adopteez-primary resize-none"
                      placeholder="Write more..."
                      rows="4"
                    />
                    <input
                      type="text"
                      value={postVideoUrl}
                      onChange={(e) => setPostVideoUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-adopteez-primary"
                      placeholder="Paste YouTube video link..."
                    />
                  </div>
                )}

                {postImagePreview && (
                  <div className="relative mb-4 mt-4">
                    <img src={postImagePreview} alt="Post preview" className="w-full rounded-xl max-h-96 object-cover" />
                    <button
                      onClick={() => {
                        setPostImage(null);
                        setPostImagePreview('');
                      }}
                      className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>

              {posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-2xl shadow-md p-6">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-12 h-12 bg-adopteez-light/50 rounded-full flex items-center justify-center flex-shrink-0">
                          {post.author?.avatar_url ? (
                            <img src={post.author.avatar_url} alt={post.author.full_name} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <Users size={24} className="text-adopteez-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{post.author?.full_name || 'Unknown'}</h4>
                          <p className="text-sm text-gray-500">{format(new Date(post.created_at), 'PPp')}</p>
                        </div>
                      </div>
                      {post.content && <p className="text-gray-700 whitespace-pre-wrap mb-4">{post.content}</p>}
                      {post.image_url && (
                        <img src={post.image_url} alt="Post content" className="w-full rounded-xl mt-4" />
                      )}
                      {post.video_url && (
                        <div className="relative w-full mt-4" style={{ paddingBottom: '56.25%' }}>
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
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-md p-20 text-center">
                  <div className="w-24 h-24 bg-adopteez-light/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ImageIcon size={48} className="text-adopteez-primary" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">{t('profile.noPostsYetTitle')}</h3>
                  <p className="text-gray-600 text-lg">{t('profile.clickToCreatePost')}</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'about' && (
            <>
              <MembershipStatus />

              <div className="bg-white rounded-2xl shadow-md p-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{t('profile.intro')}</h2>
                <button
                  onClick={() => (isEditingIntro ? handleSave() : setIsEditingIntro(true))}
                  className="px-6 py-3 bg-adopteez-light/50 text-adopteez-dark rounded-xl hover:bg-adopteez-light transition-all flex items-center space-x-2 font-semibold shadow-sm border border-adopteez-primary/20"
                >
                  <Edit size={18} />
                  <span>{isEditingIntro ? t('profile.saveIntro') : t('profile.editIntroButton')}</span>
                </button>
              </div>

              {isEditingIntro ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">Bio</label>
                        <select
                          value={formData.bio_visibility}
                          onChange={(e) => setFormData({ ...formData, bio_visibility: e.target.value })}
                          className="text-xs px-2 py-1 border border-gray-300 rounded-lg"
                        >
                          <option value="hidden">🔒 Hidden</option>
                          <option value="group">👥 Group</option>
                          <option value="public">🌍 Public</option>
                        </select>
                      </div>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                        rows="4"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">Relation to Adoption</label>
                        <select
                          value={formData.relation_to_adoption_visibility}
                          onChange={(e) => setFormData({ ...formData, relation_to_adoption_visibility: e.target.value })}
                          className="text-xs px-2 py-1 border border-gray-300 rounded-lg"
                        >
                          <option value="hidden">🔒 Hidden</option>
                          <option value="group">👥 Group</option>
                          <option value="public">🌍 Public</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={formData.relation_to_adoption}
                        onChange={(e) => setFormData({ ...formData, relation_to_adoption: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                        placeholder="e.g., Adoptive parent, Adopted person..."
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">Education</label>
                        <select
                          value={formData.education_visibility}
                          onChange={(e) => setFormData({ ...formData, education_visibility: e.target.value })}
                          className="text-xs px-2 py-1 border border-gray-300 rounded-lg"
                        >
                          <option value="hidden">🔒 Hidden</option>
                          <option value="group">👥 Group</option>
                          <option value="public">🌍 Public</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={formData.education}
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                        placeholder="Your education"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">Job</label>
                        <select
                          value={formData.job_visibility}
                          onChange={(e) => setFormData({ ...formData, job_visibility: e.target.value })}
                          className="text-xs px-2 py-1 border border-gray-300 rounded-lg"
                        >
                          <option value="hidden">🔒 Hidden</option>
                          <option value="group">👥 Group</option>
                          <option value="public">🌍 Public</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={formData.job}
                        onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                        placeholder="Your job/occupation"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">Relationship Status</label>
                        <select
                          value={formData.relationship_status_visibility}
                          onChange={(e) => setFormData({ ...formData, relationship_status_visibility: e.target.value })}
                          className="text-xs px-2 py-1 border border-gray-300 rounded-lg"
                        >
                          <option value="hidden">🔒 Hidden</option>
                          <option value="group">👥 Group</option>
                          <option value="public">🌍 Public</option>
                        </select>
                      </div>
                      <select
                        value={formData.relationship_status}
                        onChange={(e) => setFormData({ ...formData, relationship_status: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                      >
                        <option value="">Select status...</option>
                        <option value="single">Single</option>
                        <option value="in_relationship">In a Relationship</option>
                        <option value="married">Married</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">Birth Date</label>
                        <select
                          value={formData.birth_date_visibility}
                          onChange={(e) => setFormData({ ...formData, birth_date_visibility: e.target.value })}
                          className="text-xs px-2 py-1 border border-gray-300 rounded-lg"
                        >
                          <option value="hidden">🔒 Hidden</option>
                          <option value="group">👥 Group</option>
                          <option value="public">🌍 Public</option>
                        </select>
                      </div>
                      <input
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">Children (Profiles on Platform)</label>
                      <select
                        value={formData.linked_children_visibility}
                        onChange={(e) => setFormData({ ...formData, linked_children_visibility: e.target.value })}
                        className="text-xs px-2 py-1 border border-gray-300 rounded-lg"
                      >
                        <option value="hidden">🔒 Hidden</option>
                        <option value="group">👥 Group</option>
                        <option value="public">🌍 Public</option>
                      </select>
                    </div>

                    <div className="relative mb-3">
                      <input
                        type="text"
                        value={childSearchQuery}
                        onChange={(e) => {
                          setChildSearchQuery(e.target.value);
                          searchChildProfiles(e.target.value);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent pr-10"
                        placeholder="Search for profiles to link as children..."
                      />
                      <Search size={20} className="absolute right-3 top-3.5 text-gray-400" />

                      {childSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                          {childSearchResults.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => addLinkedChild(child)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-all"
                            >
                              <div className="w-10 h-10 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold">
                                {child.full_name?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{child.full_name}</p>
                                <p className="text-sm text-gray-500">{child.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {Array.isArray(formData.linked_children) && formData.linked_children.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.linked_children.map((child) => (
                          <div key={child.id} className="flex items-center space-x-2 bg-adopteez-light/30 px-3 py-2 rounded-lg">
                            <span className="text-sm font-medium">{child.full_name}</span>
                            <button
                              onClick={() => removeLinkedChild(child.id)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Privacy Settings:</strong> Control who can see each field individually.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {profile?.bio && (
                    <div className="p-5 bg-gray-50 rounded-xl">
                      <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile?.relation_to_adoption && (
                      <div className="flex items-start bg-adopteez-light/30 p-4 rounded-xl">
                        <Users size={20} className="mr-3 text-adopteez-primary mt-1" />
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-1">Relation to Adoption</p>
                          <p className="text-gray-900">{getRelationToAdoptionLabel(profile.relation_to_adoption)}</p>
                        </div>
                      </div>
                    )}

                    {profile?.education && (
                      <div className="flex items-start bg-gray-50 p-4 rounded-xl">
                        <BookOpen size={20} className="mr-3 text-adopteez-primary mt-1" />
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-1">Education</p>
                          <p className="text-gray-900">{profile.education}</p>
                        </div>
                      </div>
                    )}

                    {profile?.job && (
                      <div className="flex items-start bg-gray-50 p-4 rounded-xl">
                        <Calendar size={20} className="mr-3 text-adopteez-primary mt-1" />
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-1">Job</p>
                          <p className="text-gray-900">{profile.job}</p>
                        </div>
                      </div>
                    )}

                    {profile?.relationship_status && (
                      <div className="flex items-start bg-gray-50 p-4 rounded-xl">
                        <Users size={20} className="mr-3 text-adopteez-primary mt-1" />
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-1">Relationship Status</p>
                          <p className="text-gray-900">
                            {profile.relationship_status === 'single' && 'Single'}
                            {profile.relationship_status === 'in_relationship' && 'In a Relationship'}
                            {profile.relationship_status === 'married' && 'Married'}
                          </p>
                        </div>
                      </div>
                    )}

                    {profile?.birth_date && (
                      <div className="flex items-start bg-gray-50 p-4 rounded-xl">
                        <Calendar size={20} className="mr-3 text-adopteez-primary mt-1" />
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-1">Birth Date</p>
                          <p className="text-gray-900">{format(new Date(profile.birth_date), 'PPP')}</p>
                        </div>
                      </div>
                    )}

                    {Array.isArray(profile?.linked_children) && profile.linked_children.length > 0 && (
                      <div className="md:col-span-2 bg-adopteez-light/30 p-4 rounded-xl">
                        <p className="text-sm font-semibold text-gray-600 mb-3">Children</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.linked_children.map((child) => (
                            <div key={child.id} className="bg-white px-4 py-2 rounded-lg shadow-sm">
                              <span className="text-gray-900 font-medium">{child.full_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            </>
          )}

          {activeTab === 'children' && (
            <div className="bg-white rounded-2xl shadow-md p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">{t('profile.children')}</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowChildModal(true)}
                    className="px-6 py-3 bg-adopteez-primary text-white rounded-xl hover:bg-adopteez-dark transition-all flex items-center space-x-2 font-semibold shadow-sm"
                  >
                    <Plus size={18} />
                    <span>{t('profile.addChild')}</span>
                  </button>
                </div>
              </div>

              {children.length > 0 ? (
                <div className="space-y-5 mb-8">
                  {children.map((child) => (
                    <div key={child.id} className="bg-adopteez-light/30 border-2 border-adopteez-light/50 rounded-xl p-5 hover:shadow-lg hover:border-adopteez-primary/30 transition-all relative">
                      <button
                        onClick={() => handleEditChild(child)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-adopteez-primary hover:bg-adopteez-light/30 rounded-lg transition-all z-10"
                        title="Rediger barn"
                      >
                        <Edit size={18} />
                      </button>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-adopteez-light">
                          {child.image_url ? (
                            <img
                              src={child.image_url}
                              alt={child.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={24} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 pr-6">
                          <h3 className="font-semibold text-xl text-gray-900 mb-1">{child.name}</h3>
                          {child.birth_date && (
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <Calendar size={16} className="mr-2 text-adopteez-primary" />
                              <span>{format(new Date(child.birth_date), 'PPP')}</span>
                            </div>
                          )}
                          {child.current_city && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin size={16} className="mr-2 text-adopteez-primary" />
                              <span>{child.current_city}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 mb-8">
                  <div className="w-20 h-20 bg-adopteez-light/50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Users size={40} className="text-adopteez-primary" />
                  </div>
                  <p className="text-gray-600 text-lg">{t('profile.noChildrenYet')}</p>
                </div>
              )}

              <div className="mt-8 pt-8 border-t-2 border-gray-200">
                <FeatureGate
                  featureKey="family_tree"
                  featureName="Familietræ"
                  requiredTier="worldwide_plus"
                  inline={true}
                >
                  <FamilyTree profileId={profile?.id} isEditable={true} />
                </FeatureGate>
              </div>
            </div>
          )}

          {activeTab === 'family-stories' && (
            <div className="bg-white rounded-2xl shadow-md p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">{t('profile.familyStories')}</h2>
                <button
                  onClick={() => {
                    setEditingStory(null);
                    setStoryFormData({
                      family_name: '',
                      story_local: '',
                      story_worldwide: '',
                      city: '',
                      country: '',
                      language: 'en',
                      image_url: '',
                    });
                    setTaggedMembers([]);
                    setShowStoryModal(true);
                  }}
                  className="px-6 py-3 bg-adopteez-primary text-white rounded-xl hover:bg-adopteez-dark transition-all flex items-center space-x-2 font-semibold shadow-sm"
                >
                  <Plus size={18} />
                  <span>{t('profile.addFamilyStory')}</span>
                </button>
              </div>

              {familyStories.length > 0 ? (
                <div className="space-y-6">
                  {familyStories.map((story) => (
                    <div key={story.id} className="border-2 border-adopteez-light/50 rounded-xl overflow-hidden hover:shadow-lg hover:border-adopteez-primary/30 transition-all">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-adopteez-light">
                              {story.image_url ? (
                                <img
                                  src={story.image_url}
                                  alt={story.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Users size={28} className="text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-2xl text-gray-900 mb-2">{story.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap mb-3">
                              <span className="bg-adopteez-light/50 px-3 py-1 rounded-lg font-medium">
                                {story.language === 'en' ? 'English' : story.language === 'da' ? 'Dansk' : story.language.toUpperCase()}
                              </span>
                              {(story.city || story.country) && (
                                <span className="flex items-center">
                                  <MapPin size={14} className="mr-1" />
                                  {[story.city, story.country].filter(Boolean).join(', ')}
                                </span>
                              )}
                              <span>{format(new Date(story.created_at), 'PPP')}</span>
                            </div>
                            {story.family_story_members && story.family_story_members.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap mb-3">
                                <Users size={16} className="text-adopteez-primary" />
                                {story.family_story_members.map((member, idx) => {
                                  const name = member.profiles?.full_name || member.children?.name || 'Unknown';
                                  return (
                                    <span key={idx} className="bg-adopteez-primary/10 text-adopteez-dark px-3 py-1 rounded-lg text-sm font-medium">
                                      {name}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                            </div>
                          </div>
                          {(story.profile_id === profile.id || story.family_story_members?.some(m => m.profile_id === profile.id)) && (
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleEditStory(story)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Rediger"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteStory(story.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Slet"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                      {story.content_local && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">Local Language</span>
                          </h4>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{story.content_local}</p>
                        </div>
                      )}
                      {story.content_worldwide && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">English / Worldwide</span>
                          </h4>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{story.content_worldwide}</p>
                        </div>
                      )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-adopteez-light/50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <BookOpen size={40} className="text-adopteez-primary" />
                  </div>
                  <p className="text-gray-600 text-lg">{t('profile.noStoriesYet')}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="bg-white rounded-2xl shadow-md p-20 text-center">
              <div className="w-24 h-24 bg-adopteez-light/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon size={48} className="text-adopteez-primary" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">{t('profile.noPhotosYet')}</h3>
              <p className="text-gray-600 text-lg">{t('profile.photosWillAppear')}</p>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-white rounded-2xl shadow-md p-10">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('profile.myCalendar')}</h2>
                <p className="text-gray-600">{t('profile.eventsCommitted')}</p>
              </div>
              {myEvents.length > 0 ? (
                <div className="space-y-4">
                  {myEvents.map((event) => (
                    <div key={event.id} className="border-2 border-adopteez-light/50 rounded-xl p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                          {event.groups && (
                            <p className="text-sm text-gray-600 mb-2">From group: {event.groups.name}</p>
                          )}
                          {event.organizer && (
                            <p className="text-sm text-gray-600">Organized by {event.organizer.full_name}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                          event.event_type === 'online'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {event.event_type === 'online' ? '💻 Online' : '📍 Physical'}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-gray-700 mb-4">{event.description}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start space-x-2">
                          <Calendar size={16} className="text-adopteez-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-700">Date & Time</p>
                            <p className="text-gray-900">{format(new Date(event.start_date), 'PPP')}</p>
                            {event.start_time && (
                              <p className="text-gray-600">
                                {event.start_time}{event.end_time && ` - ${event.end_time}`}
                              </p>
                            )}
                          </div>
                        </div>

                        {(event.location || event.location_searchable) && (
                          <div className="flex items-start space-x-2">
                            <MapPin size={16} className="text-adopteez-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-gray-700">Location</p>
                              <p className="text-gray-900">{event.location}</p>
                              {event.location_searchable && (
                                <p className="text-gray-600">{event.location_searchable}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {event.is_paid && event.price && (
                          <div className="flex items-start space-x-2">
                            <span className="text-adopteez-primary">💰</span>
                            <div>
                              <p className="font-semibold text-gray-700">Price</p>
                              <p className="text-gray-900">{event.price} {event.currency}</p>
                            </div>
                          </div>
                        )}

                        {event.timezone && (
                          <div className="flex items-start space-x-2">
                            <span className="text-adopteez-primary">🌍</span>
                            <div>
                              <p className="font-semibold text-gray-700">Timezone</p>
                              <p className="text-gray-900">{event.timezone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-adopteez-light/50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Calendar size={40} className="text-adopteez-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('profile.noUpcomingEvents')}</h3>
                  <p className="text-gray-600">{t('profile.eventsWillAppear')}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="bg-white rounded-2xl shadow-md p-10">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('profile.myTickets')}</h2>
                <p className="text-gray-600">{t('feedback.description')}</p>
              </div>
              {tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => {
                    const statusColors = {
                      open: 'bg-blue-100 text-blue-800',
                      in_progress: 'bg-yellow-100 text-yellow-800',
                      resolved: 'bg-green-100 text-green-800',
                      closed: 'bg-gray-100 text-gray-800',
                    };
                    const typeColors = {
                      bug: 'bg-red-100 text-red-800',
                      feature: 'bg-blue-100 text-blue-800',
                    };
                    return (
                      <div key={ticket.id} className="border-2 border-adopteez-light/50 rounded-xl p-6 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${typeColors[ticket.type]}`}>
                                {ticket.type === 'bug' ? 'Bug Report' : 'Feature Request'}
                              </span>
                              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColors[ticket.status]}`}>
                                {ticket.status.replace('_', ' ').toUpperCase()}
                              </span>
                              {ticket.priority && (
                                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                  ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {ticket.priority.toUpperCase()} PRIORITY
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{ticket.title}</h3>
                            <p className="text-gray-600 text-sm">{ticket.description}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-4">
                          <div className="flex items-start space-x-2">
                            <Calendar size={16} className="text-adopteez-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-gray-700">Created</p>
                              <p className="text-gray-900">{format(new Date(ticket.created_at), 'PPP')}</p>
                            </div>
                          </div>
                          {ticket.ticket_status_updated_at && (
                            <div className="flex items-start space-x-2">
                              <Calendar size={16} className="text-adopteez-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-gray-700">Last Updated</p>
                                <p className="text-gray-900">{format(new Date(ticket.ticket_status_updated_at), 'PPP')}</p>
                              </div>
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
                    <MessageCircle size={40} className="text-adopteez-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No tickets yet</h3>
                  <p className="text-gray-600">Your support tickets will appear here</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <ChildFormModal
        show={showChildModal}
        onClose={() => {
          setShowChildModal(false);
          setEditingChild(null);
        }}
        onSave={handleAddChild}
        formData={childFormData}
        setFormData={setChildFormData}
        isEditing={!!editingChild}
      />

      {showStoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">
                  {editingStory ? 'Rediger Familiehistorie' : 'Tilføj Familiehistorie'}
                </h2>
                <button
                  onClick={() => {
                    setShowStoryModal(false);
                    setEditingStory(null);
                    setTaggedMembers([]);
                    setTaggedChildren([]);
                    setSearchQuery('');
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Family Name *
                  </label>
                  <input
                    type="text"
                    value={storyFormData.family_name}
                    onChange={(e) =>
                      setStoryFormData({ ...storyFormData, family_name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                    placeholder="e.g., The Hansen Family"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={storyFormData.city}
                      onChange={(e) =>
                        setStoryFormData({ ...storyFormData, city: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                      placeholder="Your city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={storyFormData.country}
                      onChange={(e) =>
                        setStoryFormData({ ...storyFormData, country: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                      placeholder="Your country"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Familiebillede
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                      {storyFormData.image_url ? (
                        <img
                          src={storyFormData.image_url}
                          alt="Family"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users size={32} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                          {uploadingStoryImage ? (
                            <>
                              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                              Uploader...
                            </>
                          ) : (
                            <>
                              <Upload size={18} />
                              Vælg billede
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleStoryImageUpload}
                          className="hidden"
                          disabled={uploadingStoryImage}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Max 5MB (JPG, PNG, GIF)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Language *
                  </label>
                  <select
                    value={storyFormData.language}
                    onChange={(e) =>
                      setStoryFormData({ ...storyFormData, language: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="da">Dansk</option>
                    <option value="sv">Svenska</option>
                    <option value="no">Norsk</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose the language. Consider using both local and English if you're in worldwide groups.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tag Family Members
                  </label>
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Search size={18} className="text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          searchProfiles(e.target.value);
                        }}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                        placeholder="Search for family members by name..."
                      />
                    </div>

                    {searchResults.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto mt-1">
                        {searchResults.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => addTaggedMember(result)}
                            className="w-full px-4 py-3 hover:bg-adopteez-light/30 transition-colors flex items-center justify-between text-left"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">{result.full_name}</p>
                              <p className="text-sm text-gray-600">{result.email}</p>
                            </div>
                            <UserPlus size={18} className="text-adopteez-primary" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {taggedMembers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {taggedMembers.map((member) => (
                        <span
                          key={member.id}
                          className="inline-flex items-center gap-2 bg-adopteez-primary/10 text-adopteez-dark px-4 py-2 rounded-xl font-medium"
                        >
                          {member.full_name}
                          <button
                            onClick={() => removeTaggedMember(member.id)}
                            className="hover:text-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Tag family members so this story appears on their profiles too
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tag Your Children
                  </label>
                  {children.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {children.map((child) => {
                        const isTagged = taggedChildren.some(c => c.id === child.id);
                        return (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => {
                              if (isTagged) {
                                setTaggedChildren(taggedChildren.filter(c => c.id !== child.id));
                              } else {
                                setTaggedChildren([...taggedChildren, child]);
                              }
                            }}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${
                              isTagged
                                ? 'bg-adopteez-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {child.name}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Du har ikke tilføjet nogen børn endnu</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Select which children are part of this story
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Local Language Story
                  </label>
                  <textarea
                    value={storyFormData.story_local}
                    onChange={(e) =>
                      setStoryFormData({ ...storyFormData, story_local: e.target.value })
                    }
                    rows="8"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                    placeholder="Write your family story in your local language (Danish, Swedish, etc.)..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For your local country-specific groups. Write in Danish, Swedish, Norwegian, etc.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    English / Worldwide Story
                  </label>
                  <textarea
                    value={storyFormData.story_worldwide}
                    onChange={(e) =>
                      setStoryFormData({ ...storyFormData, story_worldwide: e.target.value })
                    }
                    rows="8"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                    placeholder="Write your family story in English for worldwide groups..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For worldwide groups. Write in English so everyone can understand.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    Fill in at least one story (local or worldwide) *
                  </p>
                  <p className="text-xs text-blue-700">
                    You can provide both versions if you're in both local and worldwide groups.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button
                  onClick={() => {
                    setShowStoryModal(false);
                    setEditingStory(null);
                    setTaggedMembers([]);
                    setSearchQuery('');
                    setStoryFormData({
                      family_name: '',
                      story_local: '',
                      story_worldwide: '',
                      city: '',
                      country: '',
                      language: 'en',
                      image_url: '',
                    });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Annuller
                </button>
                <button
                  onClick={handleSaveFamilyStory}
                  disabled={!storyFormData.family_name || (!storyFormData.story_local && !storyFormData.story_worldwide)}
                  className="flex-1 px-6 py-3 bg-adopteez-primary text-white rounded-xl hover:bg-adopteez-dark transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingStory ? 'Gem Ændringer' : 'Tilføj Historie'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
