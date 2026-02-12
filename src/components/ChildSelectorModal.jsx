import { useState } from 'react';
import { X, Baby, Plus, User, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ChildSelectorModal({
  onClose,
  onSuccess,
  allChildren,
  profileId,
  familyMembers = [],
  parentMemberId
}) {
  const [showNewChildForm, setShowNewChildForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newChildData, setNewChildData] = useState({
    name: '',
    birth_date: '',
    gender: 'other',
  });
  const [loading, setLoading] = useState(false);

  const handleAddExistingChild = async (child) => {
    setLoading(true);
    try {
      await supabase
        .from('children')
        .update({ include_in_tree: true })
        .eq('id', child.id);

      const { data: childMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('profile_id', profileId)
        .eq('child_id', child.id)
        .maybeSingle();

      if (childMember && parentMemberId) {
        const { error: relError } = await supabase
          .from('family_relationships')
          .insert({
            profile_id: profileId,
            member_from: parentMemberId,
            member_to: childMember.id,
            relationship_type: 'child'
          });

        if (relError) throw relError;
      }

      onSuccess();
    } catch (error) {
      console.error('Error adding child to tree:', error);
      alert('Failed to add child. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFamilyMemberAsChild = async (memberId) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('family_relationships')
        .insert({
          profile_id: profileId,
          member_from: parentMemberId,
          member_to: memberId,
          relationship_type: 'child'
        });

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error adding family member as child:', error);
      alert('Failed to add family member as child. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewChild = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('children')
        .insert({
          profile_id: profileId,
          name: newChildData.name,
          birth_date: newChildData.birth_date || null,
          gender: newChildData.gender,
          include_in_tree: true,
        });

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error creating child:', error);
      alert('Failed to create child. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const childrenNotInTree = allChildren.filter(child => !child.include_in_tree);

  const allAvailableChildren = allChildren.filter(child => {
    if (!child) return false;

    const searchLower = searchQuery.toLowerCase();
    if (searchQuery && !child.name.toLowerCase().includes(searchLower)) {
      return false;
    }

    return true;
  });

  const availableFamilyMembers = familyMembers.filter(member => {
    if (!member || member.id === parentMemberId) return false;
    if (member.linked_profile_id === profileId) return false;

    const searchLower = searchQuery.toLowerCase();
    if (searchQuery && !`${member.first_name} ${member.last_name}`.toLowerCase().includes(searchLower)) {
      return false;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Add Child to Family Tree</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {!showNewChildForm ? (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Select an existing family member, child, or create a new one:
              </p>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search family members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
                />
              </div>

              {availableFamilyMembers.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-gray-900">Family Members</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {availableFamilyMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => handleAddFamilyMemberAsChild(member.id)}
                        disabled={loading}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#1A237E] hover:bg-blue-50 transition-colors flex items-center gap-4 disabled:opacity-50"
                      >
                        {member.image_url ? (
                          <img
                            src={member.image_url}
                            alt={`${member.first_name} ${member.last_name}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-[#1A237E]" />
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900">
                            {member.first_name} {member.last_name}
                          </p>
                          {member.birth_date && (
                            <p className="text-sm text-gray-600">
                              Born {new Date(member.birth_date).getFullYear()}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {allAvailableChildren.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-gray-900">Your Children</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {allAvailableChildren.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => handleAddExistingChild(child)}
                        disabled={loading}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors flex items-center gap-4 disabled:opacity-50"
                      >
                        {child.image_url ? (
                          <img
                            src={child.image_url}
                            alt={child.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <Baby className="h-6 w-6 text-orange-600" />
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900">{child.name}</p>
                          {child.birth_date && (
                            <p className="text-sm text-gray-600">
                              Born {new Date(child.birth_date).getFullYear()}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowNewChildForm(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-orange-600"
              >
                <Plus className="h-5 w-5" />
                <span className="font-semibold">Create New Child</span>
              </button>

              <button
                onClick={onClose}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors mt-4"
              >
                Cancel
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateNewChild} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Child's Name *
                </label>
                <input
                  type="text"
                  required
                  value={newChildData.name}
                  onChange={(e) => setNewChildData({ ...newChildData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={newChildData.birth_date}
                  onChange={(e) => setNewChildData({ ...newChildData, birth_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={newChildData.gender}
                  onChange={(e) => setNewChildData({ ...newChildData, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other/Prefer not to say</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewChildForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-[#FF6F00] text-white rounded-lg hover:bg-[#FFA040] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Child'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
