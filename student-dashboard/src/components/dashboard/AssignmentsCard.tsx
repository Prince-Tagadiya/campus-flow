'use client';

import { Assignment } from '@/types';
import { Upload, Eye, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface AssignmentsCardProps {
  assignments: Assignment[];
  onUploadClick: () => void;
}

export function AssignmentsCard({
  assignments,
  onUploadClick,
}: AssignmentsCardProps) {
  const getStatusChip = (status: Assignment['status']) => {
    const statusConfig = {
      pending: { class: 'status-pending', text: 'Pending' },
      submitted: { class: 'status-submitted', text: 'Submitted' },
      overdue: { class: 'status-overdue', text: 'Overdue' },
    };

    const config = statusConfig[status];
    return <span className={`status-chip ${config.class}`}>{config.text}</span>;
  };

  const getActionButton = (assignment: Assignment) => {
    if (assignment.status === 'submitted') {
      return (
        <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <Eye className="h-4 w-4 mr-1" />
          View
        </button>
      );
    }

    if (assignment.status === 'overdue') {
      return (
        <button className="flex items-center text-red-600 hover:text-red-800 transition-colors">
          <Upload className="h-4 w-4 mr-1" />
          Submit Now
        </button>
      );
    }

    return (
      <button className="flex items-center text-orange-600 hover:text-orange-800 transition-colors">
        <Upload className="h-4 w-4 mr-1" />
        Upload
      </button>
    );
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
        <button
          onClick={onUploadClick}
          className="btn-primary flex items-center"
        >
          <Upload className="h-5 w-5 mr-2" />
          New Assignment
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No assignments yet
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by creating your first assignment
          </p>
          <button onClick={onUploadClick} className="btn-primary">
            Create Assignment
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Title
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Due Date
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr
                  key={assignment.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {assignment.title}
                      </div>
                      {assignment.fileName && (
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <FileText className="h-3 w-3 mr-1" />
                          {assignment.fileName}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(assignment.dueDate, 'MMM dd, yyyy')}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusChip(assignment.status)}
                  </td>
                  <td className="py-4 px-4">{getActionButton(assignment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {assignments.filter((a) => a.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {assignments.filter((a) => a.status === 'submitted').length}
            </div>
            <div className="text-sm text-gray-500">Submitted</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {assignments.filter((a) => a.status === 'overdue').length}
            </div>
            <div className="text-sm text-gray-500">Overdue</div>
          </div>
        </div>
      </div>
    </div>
  );
}
