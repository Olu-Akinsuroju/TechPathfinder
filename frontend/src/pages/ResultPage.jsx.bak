import React, { useState, useEffect } from 'react';

// Placeholder for actual API call
const fetchLatestSubmission = async (userId = 'defaultUser') => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Placeholder data
  const placeholderData = {
    id: "abc123",
    nameOrEmail: "testuser@example.com", // Added for display
    freeText: "I love building Unity games and exploring game engines!",
    method: "hard", // or "soft"
    assignedLabel: "Game Development",
    // Placeholder description - ideally this would come from a central mapping
    pathDescription: "Dive into creating interactive experiences, from mobile games to AAA titles, using powerful tools and your imagination.",
  };

  // Simulate finding no results occasionally for testing that state
  // if (Math.random() < 0.3) {
  //   return null;
  // }

  return placeholderData;
};

const ResultPage = () => {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For actual API error handling

  useEffect(() => {
    const getSubmission = async () => {
      try {
        setLoading(true);
        // Replace 'defaultUser' with actual user ID logic when available
        const data = await fetchLatestSubmission('defaultUser');
        setSubmission(data);
      } catch (err) {
        console.error("Error fetching submission:", err);
        setError("Failed to load results. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getSubmission();
  }, []);

  const surveyLink = "https://forms.gle/1LnimSMzC9ULF5kbA"; // Provided survey link

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-lg text-slate-600 mt-4">Loading your results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 bg-red-50 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-red-700 mb-4">An Error Occurred</h2>
        <p className="text-red-600">{error}</p>
        <a
            href={surveyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300"
          >
            Try the Survey Again
          </a>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-10 bg-amber-50 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-amber-700 mb-4">No Results Yet</h2>
        <p className="text-amber-600 mb-6">
          We couldn't find any submission results for you. Please make sure you've completed the survey.
        </p>
        <a
          href={surveyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300"
        >
          Go to Survey
        </a>
      </div>
    );
  }

  // Determine badge color based on method
  const badgeColor = submission.method === 'hard'
    ? 'bg-pink-100 text-pink-700'
    : 'bg-indigo-100 text-indigo-700';
  const badgeText = submission.method === 'hard' ? 'Hard Match' : 'Soft Match';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-indigo-700">
            Your Tech Path:
          </h2>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${badgeColor}`}
          >
            {badgeText}
          </span>
        </div>

        <p className="text-5xl sm:text-6xl font-extrabold text-slate-800 mb-6 tracking-tight">
          {submission.assignedLabel}
        </p>

        {submission.pathDescription && (
          <p className="text-slate-600 mb-6 text-lg">
            {submission.pathDescription}
          </p>
        )}

        <div className="bg-slate-50 p-4 sm:p-6 rounded-xl mb-8 shadow">
          <p className="text-sm text-slate-500 mb-1">For context, you said:</p>
          <blockquote className="text-slate-700 italic text-lg">
            "{submission.freeText}"
          </blockquote>
          {submission.nameOrEmail && (
             <p className="text-xs text-slate-400 mt-3 text-right">Submitted by: {submission.nameOrEmail}</p>
          )}
        </div>

        <div className="text-center">
          <a
            href={surveyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
          >
            Retake Survey
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
