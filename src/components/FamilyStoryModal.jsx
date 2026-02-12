import { X, MapPin, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

export default function FamilyStoryModal({ story, isWorldwideGroup, onClose }) {
  const { t } = useTranslation();

  if (!story) return null;

  const storyContent = isWorldwideGroup ? story.content_worldwide : story.content_local;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{story.title}</h2>
            <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
              <span className="bg-adopteez-light/50 px-3 py-1 rounded-lg font-medium">
                {isWorldwideGroup ? 'English' : (story.language === 'en' ? 'English' : story.language === 'da' ? 'Dansk' : story.language.toUpperCase())}
              </span>
              {story.profile?.city && (
                <span className="flex items-center">
                  <MapPin size={14} className="mr-1" />
                  {story.profile.city}
                </span>
              )}
              {story.profile?.country && (
                <span>{story.profile.country}</span>
              )}
              <span>{format(new Date(story.created_at), 'PPP')}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {story.image_url && (
            <img
              src={story.image_url}
              alt={story.title}
              className="w-full h-96 object-cover rounded-xl mb-6"
            />
          )}

          {storyContent && (
            <div className="prose max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{storyContent}</p>
            </div>
          )}

          {story.family_story_members && story.family_story_members.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <Users size={20} className="text-adopteez-primary" />
                <span className="font-semibold text-gray-900">{t('groups.familyMembers')}:</span>
                {story.family_story_members.map((member, idx) => {
                  const name = member.profiles?.full_name || member.children?.name || 'Unknown';
                  return (
                    <span key={idx} className="bg-adopteez-primary/10 text-adopteez-dark px-3 py-1 rounded-lg text-sm font-medium">
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
