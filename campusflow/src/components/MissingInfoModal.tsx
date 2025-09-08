import React, { useMemo, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { AIExtractedAssignment } from '../services/aiService';

interface SubjectOption {
  id: string;
  name: string;
  code?: string;
}

interface MissingInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingFields: string[]; // we will only honor 'subject' and 'deadline'
  subjects: SubjectOption[];
  initialData: AIExtractedAssignment;
  onSubmit: (data: AIExtractedAssignment) => void;
}

const MissingInfoModal: React.FC<MissingInfoModalProps> = ({
  isOpen,
  onClose,
  missingFields,
  subjects,
  initialData,
  onSubmit,
}) => {
  const [subjectValue, setSubjectValue] = useState<string>(initialData.subject || '');
  const [deadlineValue, setDeadlineValue] = useState<string>(initialData.deadline || '');
  // We no longer collect points/instructions/requirements here per user's request

  const requiredSet = useMemo(() => new Set(missingFields || []), [missingFields]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const merged: AIExtractedAssignment = {
      ...initialData,
      subject: requiredSet.has('subject') ? (subjectValue || undefined) : initialData.subject,
      deadline: requiredSet.has('deadline') ? (deadlineValue || undefined) : initialData.deadline,
      missingFields: [],
    };

    onSubmit(merged);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900">Complete Missing Information</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {requiredSet.has('subject') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                className="w-full border rounded-lg p-2.5 bg-white"
                value={subjectValue}
                onChange={(e) => setSubjectValue(e.target.value)}
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}{s.code ? ` (${s.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {requiredSet.has('deadline') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                className="w-full border rounded-lg p-2.5"
                value={deadlineValue}
                onChange={(e) => setDeadlineValue(e.target.value)}
              />
            </div>
          )}

          {/* Per request, we only collect Subject and Deadline here */}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissingInfoModal;


