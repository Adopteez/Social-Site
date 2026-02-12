import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Bug, Lightbulb, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function FeedbackWidget() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedback_tickets')
        .insert([{
          profile_id: user.id,
          type,
          title: title.trim(),
          description: description.trim()
        }]);

      if (error) throw error;

      setSubmitted(true);
      setTimeout(() => {
        setShowForm(false);
        setSubmitted(false);
        setTitle('');
        setDescription('');
        setType('bug');
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-3">
        <MessageCircle size={20} className="text-adopteez-primary" />
        <h3 className="font-bold text-gray-900 text-lg">{t('feedback.title')}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        {t('feedback.description')}
      </p>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 bg-adopteez-primary text-white rounded-lg hover:bg-adopteez-dark transition-colors font-medium text-sm"
        >
          {t('feedback.send')}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.type')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('bug')}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  type === 'bug'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Bug size={18} />
                <span className="font-medium text-sm">{t('feedback.bug')}</span>
              </button>
              <button
                type="button"
                onClick={() => setType('feature')}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  type === 'feature'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Lightbulb size={18} />
                <span className="font-medium text-sm">{t('feedback.feature')}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('feedback.titleLabel')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('feedback.titlePlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('feedback.descriptionLabel')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('feedback.descriptionPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent resize-none text-sm"
              rows="4"
              required
            />
          </div>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800 font-medium text-sm">{t('feedback.thankYou')}</p>
            </div>
          ) : (
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setTitle('');
                  setDescription('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim() || !description.trim()}
                className="flex-1 px-4 py-2 bg-adopteez-primary text-white rounded-lg hover:bg-adopteez-dark transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('feedback.sending') : t('feedback.sendButton')}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
