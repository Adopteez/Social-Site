import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash2, User, X, Heart, Users, UserPlus, Search, Upload, Baby, Home, Link2, XCircle } from 'lucide-react';
import AddFamilyMemberModal from './AddFamilyMemberModal';
import EditFamilyMemberModal from './EditFamilyMemberModal';
import AddBiologicalParentsModal from './AddBiologicalParentsModal';
import ChildSelectorModal from './ChildSelectorModal';

export default function FamilyTree({ profileId, isEditable = false }) {
  const { t } = useTranslation();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [children, setChildren] = useState([]);
  const [allChildren, setAllChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editingChild, setEditingChild] = useState(null);
  const [selectedChildForBio, setSelectedChildForBio] = useState(null);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [selectedParentForChild, setSelectedParentForChild] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [addContext, setAddContext] = useState(null);

  useEffect(() => {
    if (profileId) {
      fetchCurrentProfile();
    }
  }, [profileId]);

  useEffect(() => {
    if (profileId && currentProfile) {
      fetchFamilyData();
    }
  }, [profileId, currentProfile]);

  const fetchCurrentProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      setCurrentProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const ensureSelfMember = async () => {
    if (!currentProfile) return;

    const { data: existingSelf } = await supabase
      .from('family_members')
      .select('*')
      .eq('profile_id', profileId)
      .eq('linked_profile_id', profileId)
      .eq('family_type', 'adoptive')
      .maybeSingle();

    const selfMemberData = {
      profile_id: profileId,
      linked_profile_id: profileId,
      family_type: 'adoptive',
      first_name: currentProfile.first_name || currentProfile.full_name?.split(' ')[0] || 'Me',
      last_name: currentProfile.last_name || currentProfile.full_name?.split(' ').slice(1).join(' ') || '',
      birth_date: currentProfile.birth_date,
      image_url: currentProfile.avatar_url,
      is_alive: true,
    };

    if (!existingSelf) {
      await supabase.from('family_members').insert({
        ...selfMemberData,
        gender: 'other',
      });
    } else {
      await supabase
        .from('family_members')
        .update({
          first_name: selfMemberData.first_name,
          last_name: selfMemberData.last_name,
          birth_date: selfMemberData.birth_date,
          image_url: selfMemberData.image_url,
        })
        .eq('id', existingSelf.id);
    }
  };

  const fetchFamilyData = async () => {
    try {
      if (currentProfile && isEditable) {
        await ensureSelfMember();
      }

      const { data: members } = await supabase
        .from('family_members')
        .select('*, linked_profile:linked_profile_id(id, first_name, last_name, avatar_url)')
        .eq('profile_id', profileId)
        .order('created_at');

      const { data: rels } = await supabase
        .from('family_relationships')
        .select('*')
        .eq('profile_id', profileId);

      const { data: allChildrenData } = await supabase
        .from('children')
        .select('*')
        .eq('profile_id', profileId);

      const { data: childrenData } = await supabase
        .from('children')
        .select('*')
        .eq('profile_id', profileId)
        .eq('include_in_tree', true);

      setFamilyMembers(members || []);
      setRelationships(rels || []);
      setAllChildren(allChildrenData || []);
      setChildren(childrenData || []);
    } catch (error) {
      console.error('Error fetching family data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTreeLayout = () => {
    const CARD_WIDTH = 240;
    const CARD_HEIGHT = 220;
    const HORIZONTAL_SPACING = 300;
    const VERTICAL_SPACING = 260;

    const positions = new Map();
    const connections = [];

    const selfMember = familyMembers.find(m =>
      m.profile_id === profileId &&
      m.linked_profile_id === profileId &&
      !m.child_id
    );

    if (!selfMember) return {
      positions,
      connections,
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
      cardWidth: CARD_WIDTH,
      cardHeight: CARD_HEIGHT
    };

    const getParents = (memberId) => {
      return familyMembers.filter(m =>
        relationships.some(r => r.member_from === m.id && r.member_to === memberId && r.relationship_type === 'parent')
      );
    };

    const getPartners = (memberId) => {
      return relationships
        .filter(r => r.relationship_type === 'spouse' && (r.member_from === memberId || r.member_to === memberId))
        .map(r => {
          const partnerId = r.member_from === memberId ? r.member_to : r.member_from;
          return { member: familyMembers.find(m => m.id === partnerId), relationship: r };
        })
        .filter(p => p.member);
    };

    const getSiblings = (memberId) => {
      const memberParents = getParents(memberId);
      if (memberParents.length === 0) return [];

      return familyMembers.filter(m =>
        m.id !== memberId &&
        getParents(m.id).some(p => memberParents.some(mp => mp.id === p.id))
      );
    };

    let currentX = 0;
    let currentY = 0;

    const partners = getPartners(selfMember.id);
    const isFemaleWithPartner = selfMember.gender === 'female' && partners.length > 0;
    const isMaleWithPartner = selfMember.gender === 'male' && partners.length > 0;

    if (isFemaleWithPartner) {
      currentX = HORIZONTAL_SPACING;
    } else if (selfMember.gender === 'other' && partners.length > 0) {
      currentX = 0;
    }

    positions.set(selfMember.id, { x: currentX, y: currentY, member: selfMember, type: 'self' });

    const parents = getParents(selfMember.id);
    if (parents.length > 0) {
      const parentY = currentY - VERTICAL_SPACING;
      if (parents.length === 1) {
        positions.set(parents[0].id, { x: currentX, y: parentY, member: parents[0], type: 'adoptive' });
        connections.push({
          from: { x: currentX + CARD_WIDTH / 2, y: parentY + CARD_HEIGHT },
          to: { x: currentX + CARD_WIDTH / 2, y: currentY },
          color: 'blue'
        });
      } else {
        const leftParentX = currentX - HORIZONTAL_SPACING / 2;
        const rightParentX = currentX + HORIZONTAL_SPACING / 2;

        const maleParent = parents.find(p => p.gender === 'male');
        const femaleParent = parents.find(p => p.gender === 'female');

        if (maleParent && femaleParent) {
          positions.set(maleParent.id, { x: leftParentX, y: parentY, member: maleParent, type: 'adoptive' });
          positions.set(femaleParent.id, { x: rightParentX, y: parentY, member: femaleParent, type: 'adoptive' });
        } else {
          positions.set(parents[0].id, { x: leftParentX, y: parentY, member: parents[0], type: 'adoptive' });
          positions.set(parents[1].id, { x: rightParentX, y: parentY, member: parents[1], type: 'adoptive' });
        }

        connections.push({
          from: { x: leftParentX + CARD_WIDTH, y: parentY + CARD_HEIGHT * 0.25 },
          to: { x: rightParentX, y: parentY + CARD_HEIGHT * 0.25 },
          color: 'blue',
          type: 'partner',
          status: relationships.find(r =>
            (r.member_from === parents[0].id && r.member_to === parents[1].id) ||
            (r.member_from === parents[1].id && r.member_to === parents[0].id)
          )?.relationship_status
        });

        const midX = (leftParentX + rightParentX) / 2 + CARD_WIDTH / 2;
        connections.push({
          from: { x: midX, y: parentY + CARD_HEIGHT },
          to: { x: currentX + CARD_WIDTH / 2, y: currentY },
          color: 'blue'
        });

        parents.forEach(parent => {
          const grandparents = getParents(parent.id);
          if (grandparents.length > 0) {
            const parentPos = positions.get(parent.id);
            const grandparentY = parentPos.y - VERTICAL_SPACING;

            if (grandparents.length === 1) {
              positions.set(grandparents[0].id, { x: parentPos.x, y: grandparentY, member: grandparents[0], type: 'adoptive' });
              connections.push({
                from: { x: parentPos.x + CARD_WIDTH / 2, y: grandparentY + CARD_HEIGHT },
                to: { x: parentPos.x + CARD_WIDTH / 2, y: parentPos.y },
                color: 'blue'
              });
            }
          }
        });
      }
    }

    partners.forEach((partnerData, index) => {
      let partnerX;

      if (selfMember.gender === 'female') {
        partnerX = 0;
      } else if (selfMember.gender === 'male') {
        partnerX = currentX + HORIZONTAL_SPACING * (index + 1);
      } else {
        partnerX = currentX + HORIZONTAL_SPACING * (index + 1);
      }

      positions.set(partnerData.member.id, {
        x: partnerX,
        y: currentY,
        member: partnerData.member,
        type: 'adoptive',
        relationship: partnerData.relationship
      });

      const fromX = Math.min(partnerX, currentX);
      const toX = Math.max(partnerX, currentX);

      connections.push({
        from: { x: fromX + CARD_WIDTH, y: currentY + CARD_HEIGHT * 0.25 },
        to: { x: toX, y: currentY + CARD_HEIGHT * 0.25 },
        color: 'orange',
        type: 'partner',
        status: partnerData.relationship.relationship_status
      });

      const partnerParents = getParents(partnerData.member.id);
      if (partnerParents.length > 0) {
        const parentY = currentY - VERTICAL_SPACING;
        if (partnerParents.length === 1) {
          positions.set(partnerParents[0].id, { x: partnerX, y: parentY, member: partnerParents[0], type: 'adoptive' });
          connections.push({
            from: { x: partnerX + CARD_WIDTH / 2, y: parentY + CARD_HEIGHT },
            to: { x: partnerX + CARD_WIDTH / 2, y: currentY },
            color: 'blue'
          });
        }
      }
    });

    const siblings = getSiblings(selfMember.id);
    if (siblings.length > 0) {
      siblings.sort((a, b) => {
        if (a.gender === 'male' && b.gender !== 'male') return -1;
        if (a.gender !== 'male' && b.gender === 'male') return 1;
        return 0;
      });

      siblings.forEach((sibling, index) => {
        const siblingX = currentX - HORIZONTAL_SPACING * (index + 1);
        positions.set(sibling.id, { x: siblingX, y: currentY, member: sibling, type: 'adoptive' });

        if (index === 0) {
          connections.push({
            from: { x: siblingX + CARD_WIDTH, y: currentY + CARD_HEIGHT / 2 },
            to: { x: currentX, y: currentY + CARD_HEIGHT / 2 },
            color: 'purple',
            type: 'sibling'
          });
        } else {
          const prevSiblingX = currentX - HORIZONTAL_SPACING * index;
          connections.push({
            from: { x: siblingX + CARD_WIDTH, y: currentY + CARD_HEIGHT / 2 },
            to: { x: prevSiblingX, y: currentY + CARD_HEIGHT / 2 },
            color: 'purple',
            type: 'sibling'
          });
        }
      });
    }

    children.forEach((child, index) => {
      const childY = currentY + VERTICAL_SPACING;
      const numChildren = children.length;
      const totalWidth = (numChildren - 1) * HORIZONTAL_SPACING;

      let parentCenterX = currentX;
      if (partners.length > 0) {
        parentCenterX = currentX + HORIZONTAL_SPACING / 2;
      }

      const startX = parentCenterX - totalWidth / 2;
      const childX = startX + index * HORIZONTAL_SPACING;

      const childPerson = {
        id: child.id,
        first_name: child.name?.split(' ')[0] || child.name || '',
        last_name: child.name?.split(' ').slice(1).join(' ') || '',
        birth_date: child.birth_date,
        image_url: child.image_url,
        gender: child.gender,
        isChild: true,
        childData: child
      };

      positions.set(child.id, { x: childX, y: childY, member: childPerson, type: 'self' });

      const bioParents = familyMembers.filter(m => m.child_id === child.id && m.family_type === 'biological');
      if (bioParents.length > 0) {
        const bioParentY = childY + VERTICAL_SPACING;
        if (bioParents.length === 1) {
          positions.set(bioParents[0].id, { x: childX, y: bioParentY, member: bioParents[0], type: 'biological' });
          connections.push({
            from: { x: childX + CARD_WIDTH / 2, y: childY + CARD_HEIGHT },
            to: { x: childX + CARD_WIDTH / 2, y: bioParentY },
            color: 'green'
          });
        } else {
          const leftBioX = childX - HORIZONTAL_SPACING / 2;
          const rightBioX = childX + HORIZONTAL_SPACING / 2;

          const maleBioParent = bioParents.find(p => p.gender === 'male');
          const femaleBioParent = bioParents.find(p => p.gender === 'female');

          if (maleBioParent && femaleBioParent) {
            positions.set(maleBioParent.id, { x: leftBioX, y: bioParentY, member: maleBioParent, type: 'biological' });
            positions.set(femaleBioParent.id, { x: rightBioX, y: bioParentY, member: femaleBioParent, type: 'biological' });
          } else {
            positions.set(bioParents[0].id, { x: leftBioX, y: bioParentY, member: bioParents[0], type: 'biological' });
            positions.set(bioParents[1].id, { x: rightBioX, y: bioParentY, member: bioParents[1], type: 'biological' });
          }

          connections.push({
            from: { x: leftBioX + CARD_WIDTH, y: bioParentY + CARD_HEIGHT * 0.25 },
            to: { x: rightBioX, y: bioParentY + CARD_HEIGHT * 0.25 },
            color: 'green',
            type: 'partner'
          });

          const midX = (leftBioX + rightBioX) / 2 + CARD_WIDTH / 2;
          connections.push({
            from: { x: childX + CARD_WIDTH / 2, y: childY + CARD_HEIGHT },
            to: { x: midX, y: bioParentY },
            color: 'green'
          });
        }
      }
    });

    if (children.length > 0) {
      let parentFromX = currentX + CARD_WIDTH / 2;
      let parentCenterX = currentX;
      if (partners.length > 0) {
        const firstPartnerX = isFemaleWithPartner ? 0 : currentX + HORIZONTAL_SPACING;
        parentFromX = (firstPartnerX + currentX) / 2 + CARD_WIDTH / 2;
        parentCenterX = (firstPartnerX + currentX) / 2;
      }

      const childY = currentY + VERTICAL_SPACING;
      const numChildren = children.length;
      const totalWidth = (numChildren - 1) * HORIZONTAL_SPACING;
      const startX = parentCenterX - totalWidth / 2;

      const firstChildX = startX + CARD_WIDTH / 2;
      const lastChildX = startX + (numChildren - 1) * HORIZONTAL_SPACING + CARD_WIDTH / 2;

      const junctionY = currentY + CARD_HEIGHT / 2 + (VERTICAL_SPACING - CARD_HEIGHT / 2) * 0.75;

      connections.push({
        from: { x: parentFromX, y: currentY + CARD_HEIGHT * 0.25 },
        to: { x: parentFromX, y: junctionY },
        color: 'orange'
      });

      if (numChildren === 1) {
        connections.push({
          from: { x: parentFromX, y: junctionY },
          to: { x: firstChildX, y: childY },
          color: 'orange'
        });
      } else {
        connections.push({
          from: { x: firstChildX, y: junctionY },
          to: { x: lastChildX, y: junctionY },
          color: 'orange'
        });

        children.forEach((child, index) => {
          const childX = startX + index * HORIZONTAL_SPACING + CARD_WIDTH / 2;
          connections.push({
            from: { x: childX, y: junctionY },
            to: { x: childX, y: childY },
            color: 'orange'
          });
        });
      }
    }

    const allX = Array.from(positions.values()).map(p => p.x);
    const allY = Array.from(positions.values()).map(p => p.y);

    return {
      positions,
      connections,
      bounds: {
        minX: Math.min(...allX, 0),
        maxX: Math.max(...allX, 0) + CARD_WIDTH,
        minY: Math.min(...allY, 0),
        maxY: Math.max(...allY, 0) + CARD_HEIGHT
      },
      cardWidth: CARD_WIDTH,
      cardHeight: CARD_HEIGHT
    };
  };

  const organizeTree = () => {
    const tree = {
      adoptive: {
        self: [],
        parents: [],
        grandparents: [],
        siblings: [],
        partners: [],
      },
      biological: {
        parents: [],
        grandparents: [],
        siblings: [],
      },
    };

    const selfMember = familyMembers.find(
      (m) => m.linked_profile_id === profileId && m.family_type === 'adoptive'
    );

    if (selfMember) {
      tree.adoptive.self.push(selfMember);

      relationships.forEach((rel) => {
        let relatedMember = null;

        if (rel.member_to === selfMember.id) {
          relatedMember = familyMembers.find((m) => m.id === rel.member_from);
        } else if (rel.member_from === selfMember.id) {
          relatedMember = familyMembers.find((m) => m.id === rel.member_to);
        }

        if (!relatedMember) return;

        if (rel.member_to === selfMember.id && rel.relationship_type === 'parent' && relatedMember.family_type === 'adoptive') {
          tree.adoptive.parents.push(relatedMember);
        } else if (rel.member_to === selfMember.id && rel.relationship_type === 'sibling' && relatedMember.family_type === 'adoptive') {
          tree.adoptive.siblings.push(relatedMember);
        } else if ((rel.member_from === selfMember.id || rel.member_to === selfMember.id) && rel.relationship_type === 'spouse') {
          tree.adoptive.partners.push({
            member: relatedMember,
            relationship: rel,
          });
        }
      });

      tree.adoptive.parents.forEach((parent) => {
        relationships.forEach((rel) => {
          const grandparent = familyMembers.find((m) => m.id === rel.member_from);
          if (grandparent && rel.member_to === parent.id && rel.relationship_type === 'parent' && grandparent.family_type === 'adoptive') {
            if (!tree.adoptive.grandparents.some((g) => g.id === grandparent.id)) {
              tree.adoptive.grandparents.push(grandparent);
            }
          }
        });
      });
    }

    familyMembers.forEach((member) => {
      if (member.family_type === 'biological') {
        const isParent = relationships.some(
          (rel) => rel.member_from === member.id && rel.relationship_type === 'parent'
        );

        if (isParent) {
          tree.biological.parents.push(member);
        }
      }
    });

    return tree;
  };

  const PersonCard = ({ person, type, relationLabel, showActions = false, onAddParent, onAddSibling, onAddPartner, onAddChild, onEdit, isChild = false }) => {
    const bgColors = {
      adoptive: 'bg-blue-50 border-blue-300',
      biological: 'bg-green-50 border-green-300',
      self: 'bg-orange-50 border-orange-400',
    };

    const badgeColors = {
      adoptive: 'bg-blue-100',
      biological: 'bg-green-100',
      self: 'bg-orange-100',
    };

    const textColors = {
      adoptive: 'text-blue-900',
      biological: 'text-green-900',
      self: 'text-orange-900',
    };

    const isMale = person.gender === 'male';
    const isFemale = person.gender === 'female';

    return (
      <div className="relative">
        {showActions && onAddParent && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <button
              onClick={onAddParent}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all"
              title="Add Parent"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}

        {showActions && onAddSibling && (
          <div className={`absolute top-1/2 -translate-y-1/2 z-20 ${
            isMale ? 'left-0 -translate-x-1/2' :
            isFemale ? 'right-0 translate-x-1/2' :
            'left-0 -translate-x-1/2'
          }`}>
            <button
              onClick={onAddSibling}
              className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all"
              title="Add Sibling"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}

        {showActions && onAddPartner && (
          <div className={`absolute top-1/2 -translate-y-1/2 z-20 ${
            isMale ? 'right-0 translate-x-1/2' :
            isFemale ? 'left-0 -translate-x-1/2' :
            'right-0 translate-x-1/2'
          }`}>
            <button
              onClick={onAddPartner}
              className="bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-full shadow-lg transition-all"
              title="Add Partner"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}

        {showActions && onAddChild && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20">
            <button
              onClick={onAddChild}
              className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full shadow-lg transition-all"
              title="Add Child"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className={`relative ${bgColors[type]} border-2 rounded-xl p-5 shadow-md w-60 transition-all hover:shadow-lg`}>
          {isEditable && (onEdit || !isChild) && (
            <button
              onClick={() => onEdit ? onEdit() : setEditingMember(person)}
              className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-gray-100 z-10"
            >
              <Edit className="h-3 w-3 text-gray-600" />
            </button>
          )}

          <div className="flex flex-col items-center">
            <div className="mb-3">
              {person.image_url ? (
                <img
                  src={person.image_url}
                  alt={person.first_name}
                  className="w-24 h-24 rounded-full object-cover border-3 border-white shadow-md"
                />
              ) : (
                <div className={`w-24 h-24 rounded-full ${badgeColors[type]} flex items-center justify-center border-3 border-white shadow-md`}>
                  <User className="h-12 w-12 text-gray-500" />
                </div>
              )}
            </div>

            {relationLabel && (
              <span className={`text-sm font-semibold ${textColors[type]} mb-1 px-2 py-0.5 ${badgeColors[type]} rounded-full`}>
                {relationLabel}
              </span>
            )}

            <h4 className={`font-bold text-base ${textColors[type]} text-center break-words max-w-full`}>
              {person.first_name} {person.last_name || ''}
            </h4>

            {person.birth_date && (
              <p className="text-sm text-gray-600 mt-1">
                {new Date(person.birth_date).getFullYear()}
                {person.death_date && ` - ${new Date(person.death_date).getFullYear()}`}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };


  const RelationshipStatusIndicator = ({ status }) => {
    const config = {
      married: {
        icon: Heart,
        color: 'text-pink-500',
        bgColor: 'bg-pink-50',
        label: 'Married',
        lineStyle: 'stroke-pink-500',
      },
      cohabiting: {
        icon: Home,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        label: 'Cohabiting',
        lineStyle: 'stroke-blue-500',
      },
      divorced: {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        label: 'Divorced',
        lineStyle: 'stroke-red-500',
      },
    };

    const { icon: Icon, color, bgColor, label, lineStyle } = config[status] || config.married;

    return (
      <div className="flex flex-col items-center">
        <svg width="160" height="4" className="overflow-visible">
          <line
            x1="0"
            y1="2"
            x2="160"
            y2="2"
            className={`${lineStyle} stroke-[3]`}
            strokeDasharray={status === 'divorced' ? '8 4' : '0'}
          />
        </svg>
        <div className={`${bgColor} ${color} p-2 rounded-full mt-2 shadow-md`} title={label}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    );
  };

  const ConnectionLine = ({ direction, length = 60, color = 'blue' }) => {
    const colors = {
      blue: 'stroke-blue-400',
      green: 'stroke-green-400',
      orange: 'stroke-orange-400',
    };

    if (direction === 'vertical') {
      return (
        <div className="flex justify-center">
          <svg width="4" height={length} className="overflow-visible">
            <line x1="2" y1="0" x2="2" y2={length} className={`${colors[color]} stroke-[3]`} />
          </svg>
        </div>
      );
    }

    if (direction === 'horizontal') {
      return (
        <div className="flex items-center">
          <svg width={length} height="4" className="overflow-visible">
            <line x1="0" y1="2" x2={length} y2="2" className={`${colors[color]} stroke-[3]`} />
          </svg>
        </div>
      );
    }

    if (direction === 'T-top') {
      return (
        <div className="flex flex-col items-center">
          <svg width={length * 2} height={length} className="overflow-visible">
            <line x1="0" y1={length - 20} x2={length * 2} y2={length - 20} className={`${colors[color]} stroke-[3]`} />
            <line x1={length} y1={length - 20} x2={length} y2={length} className={`${colors[color]} stroke-[3]`} />
          </svg>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A237E]"></div>
      </div>
    );
  }

  const layout = calculateTreeLayout();
  const tree = organizeTree();

  const renderConnectionLines = () => {
    const colors = {
      blue: 'stroke-blue-500',
      green: 'stroke-green-500',
      orange: 'stroke-orange-500',
      purple: 'stroke-purple-500'
    };

    const offsetX = -layout.bounds.minX + 200;
    const offsetY = -layout.bounds.minY + 200;

    return layout.connections.map((conn, index) => {
      const x1 = conn.from.x + offsetX;
      const y1 = conn.from.y + offsetY;
      const x2 = conn.to.x + offsetX;
      const y2 = conn.to.y + offsetY;

      if (conn.type === 'partner') {
        return (
          <g key={`connection-${index}`}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={`${colors[conn.color]} stroke-[6]`}
              strokeDasharray={conn.status === 'divorced' ? '5,5' : 'none'}
            />
            {conn.status && (
              <g transform={`translate(${(x1 + x2) / 2}, ${y1})`}>
                {conn.status === 'married' && (
                  <>
                    <circle r="16" fill="white" stroke="#FF6F00" strokeWidth="3" />
                    <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fontSize="12">❤️</text>
                  </>
                )}
                {conn.status === 'cohabiting' && (
                  <rect x="-10" y="-10" width="20" height="20" fill="white" stroke="#3b82f6" strokeWidth="2" rx="4" />
                )}
                {conn.status === 'divorced' && (
                  <circle r="12" fill="white" stroke="#ef4444" strokeWidth="2" />
                )}
              </g>
            )}
          </g>
        );
      }

      if (conn.type === 'sibling') {
        return (
          <line
            key={`connection-${index}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className={`${colors[conn.color]} stroke-[3]`}
            strokeDasharray="8,4"
          />
        );
      }

      return (
        <line
          key={`connection-${index}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          className={`${colors[conn.color]} stroke-[3]`}
        />
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Family Tree</h1>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-300 rounded"></div>
                <span>Adoptive Family</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-300 rounded"></div>
                <span>Biological Family</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-300 rounded"></div>
                <span>You/Children</span>
              </div>
            </div>
            {isEditable && (
              <div className="flex gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Plus className="h-3 w-3 text-white" />
                  </div>
                  <span>Parent</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <Plus className="h-3 w-3 text-white" />
                  </div>
                  <span>Sibling</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center">
                    <Plus className="h-3 w-3 text-white" />
                  </div>
                  <span>Partner</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                    <Plus className="h-3 w-3 text-white" />
                  </div>
                  <span>Child</span>
                </div>
              </div>
            )}
            <div className="flex gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-pink-500" />
                <span>Married</span>
              </div>
              <div className="flex items-center gap-1">
                <Home className="h-4 w-4 text-blue-500" />
                <span>Cohabiting</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>Divorced</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative" style={{
          width: `${layout.bounds.maxX - layout.bounds.minX + 400}px`,
          height: `${layout.bounds.maxY - layout.bounds.minY + 400}px`,
          margin: '0 auto'
        }}>
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
          >
            {renderConnectionLines()}
          </svg>

          {Array.from(layout.positions.entries()).map(([id, pos]) => {
            const getRelationLabel = () => {
              if (pos.member.linked_profile_id === profileId && pos.member.profile_id === profileId && !pos.member.isChild) return 'You';
              if (pos.member.isChild) return 'Child';
              if (pos.type === 'biological') {
                return pos.member.gender === 'male' ? 'Biological Father' : 'Biological Mother';
              }

              const isParent = relationships.some(r =>
                r.member_from === id && r.relationship_type === 'parent'
              );
              if (isParent) {
                return pos.member.gender === 'male' ? 'Father' : pos.member.gender === 'female' ? 'Mother' : 'Parent';
              }

              const isPartner = relationships.some(r =>
                r.relationship_type === 'spouse' &&
                (r.member_from === id || r.member_to === id)
              );
              if (isPartner) return 'Partner';

              const isSibling = relationships.some(r =>
                r.relationship_type === 'sibling' &&
                (r.member_from === id || r.member_to === id)
              );
              if (isSibling) return 'Sibling';

              return '';
            };

            const parentCount = familyMembers.filter(m =>
              relationships.some(r => r.member_to === id && r.relationship_type === 'parent')
            ).length;

            const hasPartner = relationships.some(r =>
              r.relationship_type === 'spouse' &&
              (r.member_from === id || r.member_to === id)
            );

            return (
              <div
                key={id}
                className="absolute"
                style={{
                  left: `${pos.x - layout.bounds.minX + 200}px`,
                  top: `${pos.y - layout.bounds.minY + 200}px`,
                  width: `${layout.cardWidth}px`,
                  zIndex: 10
                }}
              >
                <PersonCard
                  person={pos.member}
                  type={pos.type}
                  relationLabel={getRelationLabel()}
                  showActions={isEditable}
                  isChild={pos.member.isChild}
                  onEdit={pos.member.isChild ? () => setEditingChild(pos.member.childData) : null}
                  onAddParent={parentCount < 2 && !pos.member.isChild ? () => setAddContext({ member: pos.member, relation: 'parent', familyType: pos.type }) : null}
                  onAddSibling={pos.member.linked_profile_id === profileId && pos.member.profile_id === profileId && !pos.member.isChild ? () => setAddContext({ member: pos.member, relation: 'sibling', familyType: 'adoptive' }) : null}
                  onAddPartner={!hasPartner && !pos.member.isChild ? () => setAddContext({ member: pos.member, relation: 'partner', familyType: pos.type }) : null}
                  onAddChild={!pos.member.isChild ? () => {
                    setSelectedParentForChild(pos.member.id);
                    setShowChildSelector(true);
                  } : (pos.member.isChild && !familyMembers.some(m => m.child_id === id && m.family_type === 'biological') ? () => setSelectedChildForBio(pos.member.childData) : null)}
                />
              </div>
            );
          })}
        </div>

        {layout.positions.size === 0 && (
          <div className="text-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Users className="h-16 w-16 text-gray-300" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isEditable ? 'Start Building Your Family Tree' : 'No Family Tree Yet'}
                </h3>
                <p className="text-gray-500">
                  {isEditable
                    ? 'Click the + buttons to add family members and build your tree'
                    : 'This user has not created their family tree yet'}
                </p>
              </div>
              {isEditable && currentProfile && (
                <button
                  onClick={async () => {
                    await ensureSelfMember();
                    await fetchFamilyData();
                  }}
                  className="mt-4 bg-[#1A237E] hover:bg-[#0D1542] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Start My Family Tree
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <AddFamilyMemberModal
        isOpen={addContext !== null}
        onClose={() => setAddContext(null)}
        onSuccess={() => {
          setAddContext(null);
          fetchFamilyData();
        }}
        context={addContext}
        profileId={profileId}
        currentProfile={currentProfile}
      />

      <EditFamilyMemberModal
        isOpen={editingMember !== null}
        onClose={() => setEditingMember(null)}
        onSuccess={() => {
          setEditingMember(null);
          fetchFamilyData();
        }}
        member={editingMember}
        profileId={profileId}
        isChild={false}
      />

      <EditFamilyMemberModal
        isOpen={editingChild !== null}
        onClose={() => setEditingChild(null)}
        onSuccess={() => {
          setEditingChild(null);
          fetchFamilyData();
        }}
        member={editingChild}
        profileId={profileId}
        isChild={true}
      />

      <AddBiologicalParentsModal
        isOpen={selectedChildForBio !== null}
        onClose={() => setSelectedChildForBio(null)}
        onSuccess={() => {
          setSelectedChildForBio(null);
          fetchFamilyData();
        }}
        child={selectedChildForBio}
        profileId={profileId}
      />

      {showChildSelector && (
        <ChildSelectorModal
          onClose={() => {
            setShowChildSelector(false);
            setSelectedParentForChild(null);
          }}
          onSuccess={() => {
            setShowChildSelector(false);
            setSelectedParentForChild(null);
            fetchFamilyData();
          }}
          allChildren={allChildren}
          profileId={profileId}
          familyMembers={familyMembers}
          parentMemberId={selectedParentForChild}
        />
      )}
    </div>
  );
}
