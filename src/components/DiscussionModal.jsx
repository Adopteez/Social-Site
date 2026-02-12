import { useState } from 'react';
import { X } from 'lucide-react';

export default function DiscussionModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    content: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.title.trim() && form.content.trim()) {
      onSubmit(form);
      setForm({ title: '', content: '' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Start en ny debat</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Debat titel
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
              placeholder="Hvad handler debatten om?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Debat indhold
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-adopteez-primary focus:border-transparent resize-none"
              rows="8"
              placeholder="Skriv dit indlæg her..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              Annuller
            </button>
            <button
              type="submit"
              disabled={!form.title.trim() || !form.content.trim()}
              className="px-6 py-2.5 bg-adopteez-primary text-white rounded-xl hover:bg-adopteez-dark transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Opret debat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
