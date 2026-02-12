import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function GroupBannerUploadModal({ group, onClose, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(group?.banner_url || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vælg venligst en billedfil');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Billedet må maks være 5MB');
      return;
    }

    setError('');
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vælg venligst et billede');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${group.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('group-banners')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('group-banners')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('groups')
        .update({ banner_url: publicUrl })
        .eq('id', group.id);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error uploading banner:', err);
      setError(err.message || 'Der opstod en fejl ved upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Upload Gruppe Banner</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
            <p className="text-sm text-gray-600">
              {group.adoption_country} - {group.residence_country}
            </p>
          </div>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-adopteez-primary transition-colors">
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg object-cover"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-adopteez-primary hover:underline text-sm"
                  >
                    Vælg et andet billede
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="mx-auto text-gray-400" size={48} />
                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-adopteez-primary hover:underline font-medium"
                    >
                      Klik for at vælge et billede
                    </button>
                    <p className="text-sm text-gray-500 mt-1">eller træk og slip</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP eller GIF (maks 5MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Annuller
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="px-6 py-2 bg-adopteez-primary text-white rounded-lg hover:bg-adopteez-accent transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploader...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Banner
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
