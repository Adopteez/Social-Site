import { useState } from 'react';
import { X, Upload, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const FieldWithVisibility = ({ label, value, onChange, visibility, onVisibilityChange, type = 'text', placeholder, required = false }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && '*'}
        </label>
        <select
          value={visibility}
          onChange={(e) => onVisibilityChange(e.target.value)}
          className="text-xs px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
        >
          <option value="hidden">🔒 Hidden</option>
          <option value="group">👥 Group Only</option>
          <option value="public">🌍 Public</option>
        </select>
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export default function ChildFormModal({ show, onClose, onSave, formData, setFormData, isEditing }) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(formData.image_url || null);

  if (!show) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vælg venligst et billede');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Billedet må max være 2MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('children')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('children')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      setImagePreview(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Fejl ved upload af billede');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{isEditing ? 'Edit Child' : 'Add Child'}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              <X size={28} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Billede
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Child"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={32} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                      {uploading ? (
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
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Max 2MB (JPG, PNG, GIF)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FieldWithVisibility
                label="Name"
                value={formData.name}
                onChange={(val) => setFormData({ ...formData, name: val })}
                visibility={formData.name_visibility}
                onVisibilityChange={(val) => setFormData({ ...formData, name_visibility: val })}
                placeholder="Child's name"
                required
              />

              <FieldWithVisibility
                label="Birth Name"
                value={formData.birth_name}
                onChange={(val) => setFormData({ ...formData, birth_name: val })}
                visibility={formData.birth_name_visibility}
                onVisibilityChange={(val) => setFormData({ ...formData, birth_name_visibility: val })}
                placeholder="Original birth name"
              />

              <FieldWithVisibility
                label="Birth Date"
                type="date"
                value={formData.birth_date}
                onChange={(val) => setFormData({ ...formData, birth_date: val })}
                visibility={formData.birth_date_visibility}
                onVisibilityChange={(val) => setFormData({ ...formData, birth_date_visibility: val })}
              />

              <FieldWithVisibility
                label="Current City"
                value={formData.current_city}
                onChange={(val) => setFormData({ ...formData, current_city: val })}
                visibility={formData.current_city_visibility}
                onVisibilityChange={(val) => setFormData({ ...formData, current_city_visibility: val })}
                placeholder="Where the child lives now"
              />

              <FieldWithVisibility
                label="Birth City"
                value={formData.birth_city}
                onChange={(val) => setFormData({ ...formData, birth_city: val })}
                visibility={formData.birth_city_visibility}
                onVisibilityChange={(val) => setFormData({ ...formData, birth_city_visibility: val })}
                placeholder="Where the child was born"
              />

              <FieldWithVisibility
                label="Orphanage Name"
                value={formData.orphanage_name}
                onChange={(val) => setFormData({ ...formData, orphanage_name: val })}
                visibility={formData.orphanage_name_visibility}
                onVisibilityChange={(val) => setFormData({ ...formData, orphanage_name_visibility: val })}
                placeholder="Orphanage name (if applicable)"
              />

              <FieldWithVisibility
                label="Birth Mother"
                value={formData.birth_mother}
                onChange={(val) => setFormData({ ...formData, birth_mother: val })}
                visibility={formData.birth_mother_visibility}
                onVisibilityChange={(val) => setFormData({ ...formData, birth_mother_visibility: val })}
                placeholder="Birth mother's name"
              />

              <FieldWithVisibility
                label="Birth Father"
                value={formData.birth_father}
                onChange={(val) => setFormData({ ...formData, birth_father: val })}
                visibility={formData.birth_father_visibility}
                onVisibilityChange={(val) => setFormData({ ...formData, birth_father_visibility: val })}
                placeholder="Birth father's name"
              />
            </div>

            <FieldWithVisibility
              label="Facebook Profile"
              type="url"
              value={formData.facebook_profile}
              onChange={(val) => setFormData({ ...formData, facebook_profile: val })}
              visibility={formData.facebook_profile_visibility}
              onVisibilityChange={(val) => setFormData({ ...formData, facebook_profile_visibility: val })}
              placeholder="https://facebook.com/..."
            />

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
              <p className="text-sm text-blue-800">
                <strong>Privacy Settings:</strong>
                <br />
                🔒 <strong>Hidden</strong> - Only you can see this information
                <br />
                👥 <strong>Group Only</strong> - Visible to members of groups you join
                <br />
                🌍 <strong>Public</strong> - Visible to everyone on the platform
              </p>
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.name}
                className="flex-1 px-6 py-3 bg-adopteez-primary text-white rounded-xl hover:bg-adopteez-dark transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEditing ? 'Save Changes' : 'Add Child'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
