import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { MessageCircle, X, Users as UsersIcon, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ChatPopup from './ChatPopup';

const ChatManager = forwardRef((props, ref) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [openChats, setOpenChats] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState('conversations');

  useImperativeHandle(ref, () => ({
    openChatMenu: () => {
      setIsOpen(true);
    }
  }));

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchUnreadCount();
      fetchFriends();
      fetchGroups();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      const { data: participantData, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversation:conversations(
            id,
            name,
            is_group_chat,
            created_at
          )
        `)
        .eq('profile_id', user.id)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      const convos = participantData?.map(p => p.conversation) || [];

      for (let convo of convos) {
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('profile_id, profiles(id, full_name, avatar_url)')
          .eq('conversation_id', convo.id)
          .neq('profile_id', user.id);

        if (!convo.is_group_chat && participants && participants.length > 0) {
          const otherUser = participants[0].profiles;
          convo.name = otherUser.full_name;
          convo.avatar_url = otherUser.avatar_url;
        }
      }

      setConversations(convos);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { data: participantData, error } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', user.id);

      if (error) throw error;

      const conversationIds = participantData?.map(p => p.conversation_id) || [];

      if (conversationIds.length === 0) {
        setUnreadCount(0);
        return;
      }

      const { count, error: countError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .neq('sender_id', user.id);

      if (countError) throw countError;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;
      setFriends(profiles || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data: memberGroups, error } = await supabase
        .from('group_members')
        .select('group:groups(id, name, banner_url)')
        .eq('profile_id', user.id);

      if (error) throw error;
      setGroups(memberGroups?.map(m => m.group) || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const startChatWithFriend = async (friend) => {
    try {
      const { data: existingConvo, error: searchError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, conversation:conversations(id, name, is_group_chat)')
        .eq('profile_id', user.id);

      if (searchError) throw searchError;

      for (let convo of existingConvo || []) {
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('profile_id')
          .eq('conversation_id', convo.conversation_id);

        if (participants?.length === 2 && participants.some(p => p.profile_id === friend.id)) {
          const conversation = {
            ...convo.conversation,
            name: friend.full_name,
            avatar_url: friend.avatar_url
          };
          handleOpenChat(conversation);
          return;
        }
      }

      const { data: newConvo, error: createError } = await supabase
        .from('conversations')
        .insert([{ name: friend.full_name, is_group_chat: false }])
        .select()
        .single();

      if (createError) throw createError;

      await supabase.from('conversation_participants').insert([
        { conversation_id: newConvo.id, profile_id: user.id },
        { conversation_id: newConvo.id, profile_id: friend.id }
      ]);

      const conversation = {
        ...newConvo,
        name: friend.full_name,
        avatar_url: friend.avatar_url
      };
      handleOpenChat(conversation);
      fetchConversations();
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const startChatWithGroup = async (group) => {
    try {
      const { data: existingConvo, error: searchError } = await supabase
        .from('conversations')
        .select('id, name, is_group_chat')
        .eq('name', group.name)
        .eq('is_group_chat', true)
        .maybeSingle();

      if (searchError) throw searchError;

      if (existingConvo) {
        handleOpenChat(existingConvo);
        return;
      }

      const { data: newConvo, error: createError } = await supabase
        .from('conversations')
        .insert([{ name: group.name, is_group_chat: true }])
        .select()
        .single();

      if (createError) throw createError;

      const { data: groupMembers } = await supabase
        .from('group_members')
        .select('profile_id')
        .eq('group_id', group.id);

      if (groupMembers) {
        await supabase.from('conversation_participants').insert(
          groupMembers.map(m => ({
            conversation_id: newConvo.id,
            profile_id: m.profile_id
          }))
        );
      }

      handleOpenChat(newConvo);
      fetchConversations();
    } catch (error) {
      console.error('Error starting group chat:', error);
    }
  };

  const handleOpenChat = (conversation) => {
    if (!openChats.find(c => c.id === conversation.id)) {
      setOpenChats([...openChats, conversation]);
    }
    setIsOpen(false);
  };

  const handleCloseChat = (conversationId) => {
    setOpenChats(openChats.filter(c => c.id !== conversationId));
  };

  return (
    <>
      <div className="fixed bottom-0 right-4" style={{ zIndex: 10000 }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-adopteez-primary text-white p-4 rounded-t-2xl shadow-lg hover:bg-adopteez-dark transition-colors"
        >
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Beskeder</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('conversations')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'conversations'
                    ? 'text-adopteez-primary border-b-2 border-adopteez-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Samtaler
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'friends'
                    ? 'text-adopteez-primary border-b-2 border-adopteez-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Venner
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'groups'
                    ? 'text-adopteez-primary border-b-2 border-adopteez-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Grupper
              </button>
            </div>

            <div className="overflow-y-auto max-h-80">
              {activeTab === 'conversations' && (
                <>
                  {conversations.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">Ingen samtaler endnu</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {conversations.map((conversation) => (
                        <button
                          key={conversation.id}
                          onClick={() => handleOpenChat(conversation)}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          {conversation.avatar_url ? (
                            <img
                              src={conversation.avatar_url}
                              alt={conversation.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-adopteez-light rounded-full flex items-center justify-center">
                              <MessageCircle size={20} className="text-adopteez-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {conversation.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              Klik for at åbne chat
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'friends' && (
                <>
                  {friends.length === 0 ? (
                    <div className="p-8 text-center">
                      <User size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">Ingen venner endnu</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {friends.map((friend) => (
                        <button
                          key={friend.id}
                          onClick={() => startChatWithFriend(friend)}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          {friend.avatar_url ? (
                            <img
                              src={friend.avatar_url}
                              alt={friend.full_name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold">
                              {friend.full_name?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {friend.full_name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              Klik for at chatte
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'groups' && (
                <>
                  {groups.length === 0 ? (
                    <div className="p-8 text-center">
                      <UsersIcon size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">Ingen grupper endnu</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {groups.map((group) => (
                        <button
                          key={group.id}
                          onClick={() => startChatWithGroup(group)}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          {group.banner_url ? (
                            <img
                              src={group.banner_url}
                              alt={group.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-adopteez-light rounded-lg flex items-center justify-center">
                              <UsersIcon size={20} className="text-adopteez-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {group.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              Klik for at chatte
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {openChats.map((chat, index) => (
        <div
          key={chat.id}
          style={{ right: `${20 + (index * 330)}px`, zIndex: 9998 }}
          className="fixed bottom-0"
        >
          <ChatPopup
            conversation={chat}
            onClose={() => handleCloseChat(chat.id)}
          />
        </div>
      ))}
    </>
  );
});

ChatManager.displayName = 'ChatManager';

export default ChatManager;
