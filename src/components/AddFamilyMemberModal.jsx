import { useState, useEffect } from 'react';
import { X, Upload, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AddFamilyMemberModal({
  isOpen,
  onClose,
  onSuccess,
  context,
  profileId,
  currentProfile
}) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    death_date: '',
    gender: 'other',
    role: '',
    is_alive: true,
    relationship_notes: '',
    relationship_status: 'married',
    parents_relationship_status: 'married',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingParents, setExistingParents] = useState([]);

  useEffect(() => {
    if (isOpen && context && context.relation === 'parent') {
      fetchExistingParents();
    }
  }, [isOpen, context]);

  const fetchExistingParents = async () => {
    try {
      const { data: members } = await supabase
        .from('family_members')
        .select('*')
        .eq('profile_id', profileId);

      const { data: relationships } = await supabase
        .from('family_relationships')
        .select('*')
        .eq('profile_id', profileId)
        .eq('relationship_type', 'parent')
        .eq('member_to', context?.member?.id);

      const parents = members.filter(m =>
        relationships.some(r => r.member_from === m.id)
      );

      setExistingParents(parents);
    } catch (error) {
      console.error('Error fetching existing parents:', error);
    }
  };

  if (!isOpen || !context) return null;

  const getModalTitle = () => {
    switch (context.relation) {
      case 'parent':
        return 'Add Parent';
      case 'partner':
        return 'Add Partner';
      case 'sibling':
        return 'Add Sibling';
      case 'child':
        return 'Add Child';
      default:
        return 'Add Family Member';
    }
  };

  const getDefaultRole = () => {
    if (context.relation === 'parent') {
      return formData.gender === 'male' ? 'Father' : formData.gender === 'female' ? 'Mother' : 'Parent';
    }
    if (context.relation === 'partner') {
      return 'Partner';
    }
    if (context.relation === 'sibling') {
      return 'Sibling';
    }
    return '';
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${profileId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageUrl = await uploadImage();

      const memberData = {
        profile_id: profileId,
        family_type: context.familyType || 'adoptive',
        first_name: formData.first_name,
        last_name: formData.last_name,
        birth_date: formData.birth_date || null,
        death_date: formData.is_alive ? null : formData.death_date || null,
        gender: formData.gender,
        is_alive: formData.is_alive,
        image_url: imageUrl,
        relationship_notes: formData.relationship_notes || null,
      };

      if (context.relation === 'child') {
        const childData = {
          profile_id: profileId,
          name: `${formData.first_name} ${formData.last_name}`,
          birth_date: formData.birth_date || null,
          gender: formData.gender,
          include_in_tree: true,
          image_url: imageUrl,
        };

        const { data: newChild, error: childError } = await supabase
          .from('children')
          .insert(childData)
          .select()
          .single();

        if (childError) throw childError;

        onSuccess();
      } else {
        const { data: newMember, error: memberError } = await supabase
          .from('family_members')
          .insert(memberData)
          .select()
          .single();

        if (memberError) throw memberError;

        if (context.member) {
          let relationshipType = context.relation;
          let memberFrom = newMember.id;
          let memberTo = context.member.id;

          if (context.relation === 'partner') {
            relationshipType = 'spouse';
          } else if (context.relation === 'sibling') {
            relationshipType = 'sibling';
          } else if (context.relation === 'parent') {
            relationshipType = 'parent';
            memberFrom = newMember.id;
            memberTo = context.member.id;
          }

          const relationshipData = {
            profile_id: profileId,
            member_from: memberFrom,
            member_to: memberTo,
            relationship_type: relationshipType,
          };

          if (context.relation === 'partner') {
            relationshipData.relationship_status = formData.relationship_status;
          }

          const { error: relError } = await supabase
            .from('family_relationships')
            .insert(relationshipData);

          if (relError) throw relError;

          if (context.relation === 'parent' && existingParents.length === 1) {
            const { error: spouseError } = await supabase
              .from('family_relationships')
              .insert({
                profile_id: profileId,
                member_from: existingParents[0].id,
                member_to: newMember.id,
                relationship_type: 'spouse',
                relationship_status: formData.parents_relationship_status,
              });

            if (spouseError) throw spouseError;
          }
        }

        onSuccess();
      }
    } catch (error) {
      console.error('Error adding family member:', error);
      alert('Failed to add family member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{getModalTitle()}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200 shadow-lg">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-[#FF6F00] text-white p-2 rounded-full cursor-pointer hover:bg-[#FFA040] transition-colors shadow-lg">
                <Upload className="h-5 w-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">Upload photo (optional)</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender/Role
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other/Prefer not to say</option>
              </select>
            </div>

            {context.relation === 'parent' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Parent Role
                </label>
                <select
                  value={formData.role || getDefaultRole()}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Parent">Parent</option>
                  <option value="Step-Father">Step-Father</option>
                  <option value="Step-Mother">Step-Mother</option>
                </select>
              </div>
            )}

            {context.relation === 'partner' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Relationship Status
                </label>
                <select
                  value={formData.relationship_status}
                  onChange={(e) => setFormData({ ...formData, relationship_status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
                >
                  <option value="married">Married</option>
                  <option value="cohabiting">Cohabiting</option>
                  <option value="divorced">Divorced</option>
                </select>
              </div>
            )}

            {context.relation === 'parent' && existingParents.length === 1 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Relationship with {existingParents[0].first_name}
                </label>
                <select
                  value={formData.parents_relationship_status}
                  onChange={(e) => setFormData({ ...formData, parents_relationship_status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
                >
                  <option value="married">Married</option>
                  <option value="cohabiting">Cohabiting</option>
                  <option value="divorced">Divorced</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Birth Year
            </label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_alive"
              checked={formData.is_alive}
              onChange={(e) => setFormData({ ...formData, is_alive: e.target.checked })}
              className="w-4 h-4 text-[#1A237E] border-gray-300 rounded focus:ring-[#1A237E]"
            />
            <label htmlFor="is_alive" className="text-sm font-medium text-gray-700">
              Still alive
            </label>
          </div>

          {!formData.is_alive && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Death Year
              </label>
              <input
                type="date"
                value={formData.death_date}
                onChange={(e) => setFormData({ ...formData, death_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.relationship_notes}
              onChange={(e) => setFormData({ ...formData, relationship_notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
              placeholder="Any additional notes about this family member..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#1A237E] text-white rounded-lg hover:bg-blue-900 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Family Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
