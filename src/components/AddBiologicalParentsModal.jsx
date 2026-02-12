import { useState } from 'react';
import { X, Upload, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AddBiologicalParentsModal({
  isOpen,
  onClose,
  onSuccess,
  child,
  profileId
}) {
  const [parents, setParents] = useState([
    { first_name: '', last_name: '', gender: 'male', birth_date: '', image: null, imagePreview: null },
    { first_name: '', last_name: '', gender: 'female', birth_date: '', image: null, imagePreview: null }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !child) return null;

  const handleImageSelect = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newParents = [...parents];
      newParents[index].image = file;
      const reader = new FileReader();
      reader.onloadend = () => {
        newParents[index].imagePreview = reader.result;
        setParents(newParents);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${profileId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file);

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
      for (const parent of parents) {
        if (parent.first_name.trim() === '') continue;

        const imageUrl = await uploadImage(parent.image);

        const memberData = {
          profile_id: profileId,
          family_type: 'biological',
          first_name: parent.first_name,
          last_name: parent.last_name,
          birth_date: parent.birth_date || null,
          gender: parent.gender,
          is_alive: true,
          image_url: imageUrl,
          child_id: child.id,
        };

        const { error } = await supabase
          .from('family_members')
          .insert(memberData);

        if (error) throw error;
      }

      onSuccess();
    } catch (error) {
      console.error('Error adding biological parents:', error);
      alert('Failed to add biological parents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Add Biological Parents</h3>
            <p className="text-sm text-gray-600 mt-1">For {child.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid md:grid-cols-2 gap-8 mb-6">
            {parents.map((parent, index) => (
              <div key={index} className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-4">
                  {index === 0 ? 'Biological Father' : 'Biological Mother'}
                </h4>

                <div className="flex flex-col items-center mb-4">
                  <div className="relative">
                    {parent.imagePreview ? (
                      <img
                        src={parent.imagePreview}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center border-4 border-white shadow-lg">
                        <User className="h-12 w-12 text-green-600" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors shadow-lg">
                      <Upload className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageSelect(index, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={parent.first_name}
                      onChange={(e) => {
                        const newParents = [...parents];
                        newParents[index].first_name = e.target.value;
                        setParents(newParents);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={parent.last_name}
                      onChange={(e) => {
                        const newParents = [...parents];
                        newParents[index].last_name = e.target.value;
                        setParents(newParents);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={parent.gender}
                      onChange={(e) => {
                        const newParents = [...parents];
                        newParents[index].gender = e.target.value;
                        setParents(newParents);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Birth Year
                    </label>
                    <input
                      type="date"
                      value={parent.birth_date}
                      onChange={(e) => {
                        const newParents = [...parents];
                        newParents[index].birth_date = e.target.value;
                        setParents(newParents);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
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
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Biological Parents'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
