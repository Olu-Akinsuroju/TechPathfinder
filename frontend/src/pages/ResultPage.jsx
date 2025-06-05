import React, { useState, useEffect } from 'react';
import apiClient from '../api'; // Import the apiClient instance

const ResultPage = () => {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const getSubmission = async () => {
      try {
        setLoading(true);
        setNotFound(false); // Reset notFound state on new fetch attempt
        setError(null);     // Reset error state

        // Using a placeholder userId for now.
        // When user authentication is implemented, this should be dynamic.
        const response = await apiClient.get('/submissions/latest', {
          // params: { userId: 'currentUserPlaceholder' } // Backend currently ignores userId
        });

        if (response.data && response.data.found === true) {
          setSubmission(response.data);
        } else {
          // This case handles when backend returns { "found": false }
          // or if data is not in the expected structure but not an HTTP error
          setNotFound(true);
          setSubmission(null); // Clear any old submission
        }

      } catch (err) {
        console.error("Error fetching submission:", err);
        if (err.response && err.response.status === 404) {
          setNotFound(true);
          setSubmission(null); // Clear any old submission
        } else {
          setError("Failed to load results. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    getSubmission();
  }, []); // Empty dependency array means this runs once on mount

  const surveyLink = "https://forms.gle/1LnimSMzC9ULF5kbA";

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

  if (notFound || !submission) { // Combined condition
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
    : submission.method === 'soft'
      ? 'bg-indigo-100 text-indigo-700'
      : 'bg-gray-100 text-gray-700'; // Fallback for other methods like 'soft_failed'

  const badgeText = submission.method === 'hard'
    ? 'Hard Match'
    : submission.method === 'soft'
      ? 'Soft Match'
      : submission.method === 'soft_failed'
        ? 'AI Classification Pending/Failed' // More descriptive for this case
        : 'Unknown Method';


  // Placeholder for path descriptions - these would ideally come from a mapping or the API
  const pathDescriptions = {
    "Game Development": "Dive into creating interactive experiences, from mobile games to AAA titles, using powerful tools and your imagination.",
    "DevOps/Cloud": "Master the art of building, deploying, and managing scalable applications and infrastructure in the cloud.",
    "Data Science/AI": "Unlock insights from data and build intelligent systems using machine learning and statistical modeling.",
    "Embedded Systems/IoT": "Design and program the hardware and software that powers smart devices and the Internet of Things.",
    "Blockchain": "Explore the decentralized world of blockchain technology, cryptocurrencies, and smart contracts.",
    "AR/VR": "Create immersive augmented and virtual reality experiences that blend the digital and physical worlds.",
    "UX/UI Design": "Craft intuitive and engaging user experiences and interfaces for websites, apps, and digital products.",
    "Cybersecurity": "Protect systems, networks, and data from digital threats and vulnerabilities.",
    "Web Development": "Build dynamic and interactive websites and web applications using a variety of frontend and backend technologies.",
    "Mobile Apps": "Develop applications for iOS and Android devices, reaching users on the go.",
    "General Programming": "Focus on foundational programming concepts, algorithms, and software development principles applicable across various domains.",
    "Undefined Category": "Your interests are broad! Further exploration might be needed to pinpoint a specific path.",
    "Classification Unavailable": "We couldn't determine a path at this time. Please try the survey again.",
    "Classification Failed": "An issue occurred during classification. Please try the survey again.",
    "Classification Error": "An error occurred while trying to classify your response. Please try the survey again.",
    "Unknown": "The classification method or result is unknown. Please try the survey again."
  };
  const currentPathDescription = pathDescriptions[submission.assignedLabel] || "Explore this exciting field further to learn more!";


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

        <p className="text-slate-600 mb-6 text-lg">
          {currentPathDescription}
        </p>

        <div className="bg-slate-50 p-4 sm:p-6 rounded-xl mb-8 shadow">
          <p className="text-sm text-slate-500 mb-1">For context, you said:</p>
          <blockquote className="text-slate-700 italic text-lg">
            "{submission.freeText}"
          </blockquote>
          {/* Assuming 'nameOrEmail' is not part of the latest_submission_data from backend for now */}
          {/* {submission.nameOrEmail && (
             <p className="text-xs text-slate-400 mt-3 text-right">Submitted by: {submission.nameOrEmail}</p>
          )} */}
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
