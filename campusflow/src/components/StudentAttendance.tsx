import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { submitAttendance } from '../services/attendanceService';

// For MVP we accept pasted QR payload: ATT:<sessionId>:<code>

const StudentAttendance: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [payload, setPayload] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const trimmed = payload.trim();
    if (!trimmed.startsWith('ATT:')) {
      setStatus('Invalid QR payload');
      return;
    }
    const parts = trimmed.split(':');
    if (parts.length !== 3) {
      setStatus('Invalid QR format');
      return;
    }
    const [, sessionId, code] = parts;
    if (!sessionId || !code) {
      setStatus('Invalid data');
      return;
    }
    if (!currentUser) {
      setStatus('Not logged in');
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitAttendance(sessionId, currentUser.id, currentUser.name, code);
      if (res.success) setStatus('Attendance recorded');
      else setStatus(res.message || 'Failed to record attendance');
    } catch (e: any) {
      setStatus(e?.message || 'Error submitting attendance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Student</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">{currentUser?.name}</span>
            <button onClick={logout} className="text-gray-600 hover:text-gray-800">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Scan QR / Enter Code</h1>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">QR Payload</label>
              <input
                type="text"
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="input-field w-full"
                placeholder="ATT:sessionId:CODE"
                required
              />
            </div>
            <button type="submit" disabled={submitting} className={`btn-primary ${submitting ? 'opacity-70' : ''}`}>
              {submitting ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </form>
          {status && <div className="mt-4 text-sm text-gray-700">{status}</div>}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
