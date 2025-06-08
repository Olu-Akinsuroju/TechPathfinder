import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmissionById } from '../api'; // Adjusted path from ../../api assuming this file is in src/pages

const ResultPage = () => {
  const { submissionId } = useParams();
  const [submissionData, setSubmissionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (submissionId) {
      setIsLoading(true);
      setError(null);
      getSubmissionById(submissionId)
        .then(data => {
          setSubmissionData(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Error fetching submission data:", err);
          setError(err.message || 'Failed to fetch submission details.');
          setIsLoading(false);
        });
    }
  }, [submissionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="text-gray-700 text-lg ml-4">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
        <p className="text-red-500 mb-6">{error}</p>
        <Link to="/" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Back to Survey
        </Link>
      </div>
    );
  }

  if (!submissionData) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">No Submission Data</h2>
        <p className="text-gray-500 mb-6">Could not retrieve submission details.</p>
        <Link to="/" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Back to Survey
        </Link>
      </div>
    );
  }

  // Determine badge style based on submissionData.hardOrSoft
  const isHardMatch = submissionData.hardOrSoft === 'hard';
  const badgeClasses = `px-3 py-1 inline-block rounded-full text-sm font-semibold ${
    isHardMatch
      ? 'bg-pink-100 text-pink-700'
      : 'bg-indigo-100 text-indigo-700'
  }`;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Your Tech Path Result</h1>
          <span className={badgeClasses}>
            {submissionData.hardOrSoft === 'hard' ? 'Hard Match' :
             submissionData.hardOrSoft === 'soft' ? 'Soft Match' :
             'Classification Method Unknown'} {/* Added fallback for unknown method */}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">Recommended Path:</h2>
            <p className="text-2xl text-gray-800">{submissionData.assignedLabel || 'N/A'}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">You said (Why CS):</h3>
            <p className="text-gray-600 italic">"{submissionData.whyCS || 'Not provided'}"</p>
          </div>

          {submissionData.dreamProject && (
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">Your Dream Project/Job:</h3>
              <p className="text-gray-600 italic">"{submissionData.dreamProject}"</p>
            </div>
          )}

          {/* Optionally, list other key inputs for context */}
          {submissionData.motivation && (
              <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">Your Motivation:</h3>
                  <p className="text-gray-600">{submissionData.motivation}</p>
              </div>
          )}
          {submissionData.excitement && (
              <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">Exciting Activity:</h3>
                  <p className="text-gray-600">{submissionData.excitement}</p>
              </div>
          )}
          {submissionData.tools && submissionData.tools.length > 0 && (
              <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">Preferred Tools:</h3>
                  <p className="text-gray-600">{submissionData.tools.join(', ')}</p>
              </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/" className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-lg transform hover:scale-105">
              Take the Survey Again
            </Link>
          </div>
        </div>
      </div>
       <footer className="text-center mt-8 text-gray-500 text-sm">
          Submission ID: {submissionId} <br/>
          Timestamp: {submissionData.timestamp ? new Date(submissionData.timestamp * 1000).toLocaleString() : 'N/A'}
      </footer>
    </div>
  );
};

export default ResultPage;
