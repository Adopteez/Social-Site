import { useState, useEffect } from 'react';
import { UserX, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ExclusionModal({ member, groupId, onClose, onSuccess }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [warningCount, setWarningCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWarningCount();
  }, [member?.id, groupId]);

  const fetchWarningCount = async () => {
    if (!member?.id || !groupId) return;

    try {
      const { count, error } = await supabase
        .from('member_warnings')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', member.id)
        .eq('group_id', groupId);

      if (error) throw error;
      setWarningCount(count || 0);
    } catch (error) {
      console.error('Error fetching warnings:', error);
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('exclusion_recommendations')
        .insert({
          profile_id: member.id,
          group_id: groupId,
          recommended_by: (await supabase.auth.getUser()).data.user.id,
          reason,
          description,
          warning_count: warningCount
        });

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating exclusion recommendation:', error);
      alert('Fejl ved oprettelse af eksklusionsanbefaling');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-full">
              <UserX className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Anbefal Udelukkelse</h3>
              <p className="text-sm text-gray-600">{member?.full_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            Dette medlem har <strong>{warningCount} advarsel{warningCount !== 1 ? 'er' : ''}</strong> i denne gruppe.
            Super admin vil gennemgå din anbefaling.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Årsag til udelukkelse
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Kort beskrivelse af årsagen..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detaljeret beskrivelse
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskriv hvorfor dette medlem bør udelukkes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
              rows="5"
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuller
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || submitting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Sender...' : 'Send Anbefaling'}
          </button>
        </div>
      </div>
    </div>
  );
}
