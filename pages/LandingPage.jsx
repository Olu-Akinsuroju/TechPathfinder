import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="text-center py-10">
      <h1 className="text-4xl font-bold text-indigo-700 mb-6">
        Discover Your Tech Path
      </h1>
      <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
        Answer a few simple questions in our survey and let our advanced classification system
        guide you to a tech path that aligns with your interests!
      </p>
      <div className="space-y-4">
        <Link
          to="/result"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
        >
          View My Path Results
        </Link>
        <p className="text-sm text-slate-500">
          (Make sure you've completed the survey first!)
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
