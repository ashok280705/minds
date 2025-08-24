'use client';

import { useState } from 'react';
import { dataAgentAPI } from '@/lib/apiClient';

export default function ReportAnalysisPage() {
  const [patientNote, setPatientNote] = useState('');
  const [patientJsonText, setPatientJsonText] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await dataAgentAPI.ingestPatientData({
        patientNote: patientNote || null,
        patientJsonText: patientJsonText || null,
        images: Array.from(images)
      });
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Multi-Agent Healthcare Analysis</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Patient Data Input</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Clinical Notes
              </label>
              <textarea
                value={patientNote}
                onChange={(e) => setPatientNote(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Enter patient clinical notes, symptoms, observations..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Structured Patient Data (JSON)
              </label>
              <textarea
                value={patientJsonText}
                onChange={(e) => setPatientJsonText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder='{"age": 45, "gender": "M", "blood_pressure": "140/90", "temperature": "98.6"}'
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Images (X-rays, MRI, etc.)
              </label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => setImages(e.target.files)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Upload JPG or PNG medical images</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing with AI Agents...' : 'Analyze Patient Data'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Patient Bundle Created Successfully
            </h3>
            <p className="text-green-700 mb-4">
              Data has been processed and sent to the next agent for analysis.
            </p>
            <div className="text-sm text-green-600">
              Request ID: {result.request_id}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}