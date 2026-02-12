import { useState, useEffect } from 'react';
import { X, Upload, User, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function EditFamilyMemberModal({
  isOpen,
  onClose,
  onSuccess,
  member,
  profileId,
  isChild = false
}) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    death_date: '',
    gender: 'other',
    is_alive: true,
    notes: '',
  });
  const [relationshipStatus, setRelationshipStatus] = useState('married');
  const [relationshipId, setRelationshipId] = useState(null);
  const [isSpouse, setIsSpouse] = useState(false);
  const [selectedSpouseId, setSelectedSpouseId] = useState('');
  const [allFamilyMembers, setAllFamilyMembers] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (member && isOpen) {
      if (isChild) {
        setFormData({
          first_name: member.name?.split(' ')[0] || '',
          last_name: member.name?.split(' ').slice(1).join(' ') || '',
          birth_date: member.birth_date || '',
          death_date: '',
          gender: member.gender || 'other',
          is_alive: true,
          notes: '',
        });
        setImagePreview(member.image_url);
      } else {
        setFormData({
          first_name: member.first_name || '',
          last_name: member.last_name || '',
          birth_date: member.birth_date || '',
          death_date: member.death_date || '',
          gender: member.gender || 'other',
          is_alive: member.is_alive ?? true,
          notes: member.notes || '',
        });
        setImagePreview(member.image_url);

        fetchAllFamilyMembers();
        checkIfSpouse();
      }
    }
  }, [member, isChild, isOpen]);

  const fetchAllFamilyMembers = async () => {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('profile_id', profileId)
      .order('first_name');

    if (!error && data) {
      setAllFamilyMembers(data.filter(m => m.id !== member?.id));
    }
  };

  const checkIfSpouse = async () => {
    if (!member || isChild) return;

    const { data: relationship } = await supabase
      .from('family_relationships')
      .select('*')
      .eq('profile_id', profileId)
      .eq('relationship_type', 'spouse')
      .or(`member_from.eq.${member.id},member_to.eq.${member.id}`)
      .maybeSingle();

    if (relationship) {
      setIsSpouse(true);
      setRelationshipId(relationship.id);
      setRelationshipStatus(relationship.relationship_status || 'married');
      const spouseId = relationship.member_from === member.id ? relationship.member_to : relationship.member_from;
      setSelectedSpouseId(spouseId);
    }
  };

  if (!isOpen || !member) return null;

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
    if (!imageFile) return imagePreview;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${profileId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return imagePreview;
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

      if (isChild) {
        const { error } = await supabase
          .from('children')
          .update({
            name: `${formData.first_name} ${formData.last_name}`,
            birth_date: formData.birth_date || null,
            gender: formData.gender,
            image_url: imageUrl,
          })
          .eq('id', member.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('family_members')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            birth_date: formData.birth_date || null,
            death_date: formData.is_alive ? null : formData.death_date || null,
            gender: formData.gender,
            is_alive: formData.is_alive,
            image_url: imageUrl,
            notes: formData.notes || null,
          })
          .eq('id', member.id);

        if (error) throw error;

        if (selectedSpouseId) {
          if (relationshipId) {
            const { error: relError } = await supabase
              .from('family_relationships')
              .update({
                relationship_status: relationshipStatus,
                member_to: selectedSpouseId,
              })
              .eq('id', relationshipId);

            if (relError) throw relError;
          } else {
            const { error: relError } = await supabase
              .from('family_relationships')
              .insert({
                profile_id: profileId,
                relationship_type: 'spouse',
                relationship_status: relationshipStatus,
                member_from: member.id,
                member_to: selectedSpouseId,
              });

            if (relError) throw relError;
          }
        } else if (relationshipId) {
          await supabase
            .from('family_relationships')
            .delete()
            .eq('id', relationshipId);
        }
      }

      onSuccess();
    } catch (error) {
      console.error('Error updating family member:', error);
      alert('Failed to update family member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);

    try {
      if (isChild) {
        const { error: relError } = await supabase
          .from('family_members')
          .delete()
          .eq('child_id', member.id);

        const { error } = await supabase
          .from('children')
          .delete()
          .eq('id', member.id);

        if (error) throw error;
      } else {
        const { error: relError } = await supabase
          .from('family_relationships')
          .delete()
          .or(`member_from.eq.${member.id},member_to.eq.${member.id}`);

        const { error } = await supabase
          .from('family_members')
          .delete()
          .eq('id', member.id);

        if (error) throw error;
      }

      onSuccess();
    } catch (error) {
      console.error('Error deleting family member:', error);
      alert('Failed to delete family member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            Edit {isChild ? 'Child' : 'Family Member'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!showDeleteConfirm ? (
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
              <p className="text-sm text-gray-500 mt-2">Change photo</p>
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender
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

            {!isChild && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Married to / Partner
                  </label>
                  <select
                    value={selectedSpouseId}
                    onChange={(e) => setSelectedSpouseId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
                  >
                    <option value="">None</option>
                    {allFamilyMembers.map((fm) => (
                      <option key={fm.id} value={fm.id}>
                        {fm.first_name} {fm.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSpouseId && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Relationship Status
                    </label>
                    <select
                      value={relationshipStatus}
                      onChange={(e) => setRelationshipStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
                    >
                      <option value="married">Married</option>
                      <option value="cohabiting">Cohabiting</option>
                      <option value="divorced">Divorced</option>
                    </select>
                  </div>
                )}
              </>
            )}

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

            {!isChild && (
              <>
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
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
                    placeholder="Any additional notes..."
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-semibold transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
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
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Family Member</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this family member? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
