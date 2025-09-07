import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, AlertCircle, Edit, Calendar, BookOpen, Flag, FileText } from 'lucide-react';
import { AIExtractedAssignment } from '../services/aiService';

interface AIAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedData: AIExtractedAssignment;
  onConfirm: (data: AIExtractedAssignment) => void;
  onEdit: () => void;
}

const AIAssignmentModal: React.FC<AIAssignmentModalProps> = ({
  isOpen,
  onClose,
  extractedData,
  onConfirm,
  onEdit
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(extractedData);
      onClose();
    } catch (error) {
      console.error('Error confirming assignment:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Extracted Assignment Details</h2>
              <p className="text-sm text-gray-600">Review and confirm the details below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Confidence Score */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">AI Confidence</span>
            </div>
            <div className={`text-sm font-semibold ${getConfidenceColor(extractedData.confidence)}`}>
              {getConfidenceText(extractedData.confidence)} ({Math.round(extractedData.confidence * 100)}%)
            </div>
          </div>

          {/* Assignment Details */}
          <div className="space-y-4">
            {/* Title */}
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-gray-900">{extractedData.title}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex items-start space-x-3">
              <BookOpen className="w-5 h-5 text-green-600 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-gray-900">{extractedData.description}</p>
                </div>
              </div>
            </div>

            {/* Deadline */}
            {extractedData.deadline && (
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-red-600 mt-1" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-gray-900">{new Date(extractedData.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Subject */}
            {extractedData.subject && (
              <div className="flex items-start space-x-3">
                <BookOpen className="w-5 h-5 text-purple-600 mt-1" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-gray-900">{extractedData.subject}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Priority */}
            <div className="flex items-start space-x-3">
              <Flag className="w-5 h-5 text-orange-600 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    extractedData.priority === 'high' ? 'bg-red-100 text-red-800' :
                    extractedData.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {extractedData.priority?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            {extractedData.instructions && (
              <div className="flex items-start space-x-3">
                <Edit className="w-5 h-5 text-indigo-600 mt-1" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-gray-900 whitespace-pre-wrap">{extractedData.instructions}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Points */}
            {extractedData.points && (
              <div className="flex items-start space-x-3">
                <Flag className="w-5 h-5 text-indigo-600 mt-1" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-gray-900 font-semibold">{extractedData.points} points</p>
                  </div>
                </div>
              </div>
            )}

            {/* Requirements */}
            {extractedData.requirements && extractedData.requirements.length > 0 && (
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-teal-600 mt-1" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                  <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                    <ul className="space-y-1">
                      {extractedData.requirements.map((req, index) => (
                        <li key={index} className="text-gray-900 flex items-start">
                          <span className="w-2 h-2 bg-teal-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Missing Fields Alert */}
          {extractedData.missingFields && extractedData.missingFields.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-amber-800 mb-2">Please complete these fields manually:</h4>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.missingFields.map((field, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full border border-amber-300"
                      >
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-amber-700 mt-2">
                    These fields couldn't be extracted from the document. You can edit them after creating the assignment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Low Confidence Alert */}
          {extractedData.confidence < 0.6 && (!extractedData.missingFields || extractedData.missingFields.length === 0) && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Low confidence extraction</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    The AI had difficulty extracting some information. Please review the details carefully.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={onEdit}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit Details
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isConfirming}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isConfirming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm & Create</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssignmentModal;
