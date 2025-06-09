import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for internal navigation
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
        setNotFound(false);
        setError(null);

        const response = await apiClient.get('/submissions/latest');

        if (response.data && response.data.found === true) {
          setSubmission(response.data);
        } else {
          setNotFound(true);
          setSubmission(null);
        }
      } catch (err) {
        console.error("Error fetching submission:", err);
        if (err.response && err.response.status === 404) {
          setNotFound(true);
          setSubmission(null);
        } else {
          setError("Failed to load results. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    getSubmission();
  }, []);

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex flex-column justify-content-center align-items-center p-3">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-3 fs-5">Loading your results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex flex-column justify-content-center align-items-center p-3 text-center">
        <div className="card shadow-sm p-4">
          <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '3rem' }}></i>
          <h2 className="text-danger mt-3">An Error Occurred</h2>
          <p className="text-muted">{error}</p>
          <Link to="/" className="btn btn-primary mt-3">
            Try the Survey Again
          </Link>
        </div>
      </div>
    );
  }

  if (notFound || !submission) {
    return (
      <div className="min-vh-100 bg-light d-flex flex-column justify-content-center align-items-center p-3 text-center">
        <div className="card shadow-sm p-4">
          <i className="bi bi-search text-warning" style={{ fontSize: '3rem' }}></i>
          <h2 className="text-warning mt-3">No Results Yet</h2>
          <p className="text-muted mb-4">
            We couldn't find any submission results for you. Please make sure you've completed the survey.
          </p>
          <Link to="/" className="btn btn-primary">
            Go to Survey
          </Link>
        </div>
      </div>
    );
  }

  // If submission is available, render the main result card
  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-7">
            <div className="card shadow-lg rounded-4 p-4 p-md-5 text-center">

              <h4 className="text-muted">Your Tech Path Is:</h4>
              <h1 className="fw-bold mb-3" style={{ color: '#66CCBB' }}>
                {submission.assignedLabel || "Calculating..."}
              </h1>

              {submission.method === 'hard' && (
                <span className="badge fs-6 py-2 px-3 rounded-pill bg-success mb-3 align-self-center">Hard Match</span>
              )}
              {submission.method === 'soft' && (
                <span className="badge fs-6 py-2 px-3 rounded-pill mb-3 align-self-center" style={{ backgroundColor: '#FD7E14', color: 'white' }}>Soft Match</span>
              )}
              {submission.method !== 'hard' && submission.method !== 'soft' && submission.method && (
                <span className="badge fs-6 py-2 px-3 rounded-pill bg-secondary mb-3 align-self-center">Status: {submission.method}</span>
              )}

              {submission.method === 'hard' && (
                <div className="progress mt-3 mb-4" style={{ height: '25px' }}>
                  <div className="progress-bar bg-success fw-bold" role="progressbar" style={{ width: '100%' }} aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">Strong Match</div>
                </div>
              )}
              {submission.method === 'soft' && (
                <div className="progress mt-3 mb-4" style={{ height: '25px' }}>
                  <div className="progress-bar fw-bold" role="progressbar" style={{ width: '70%', backgroundColor: '#FFD700', color: '#343A40' }} aria-valuenow="70" aria-valuemin="0" aria-valuemax="100">Likely Fit</div>
                </div>
              )}

              {submission.freeText && (
                <div className="text-start border p-3 rounded mb-4 bg-white shadow-sm mt-3">
                  <h5 className="fw-semibold" style={{ color: '#66CCBB' }}>
                    <i className="bi bi-chat-left-text-fill me-2"></i>Your Project Idea:
                  </h5>
                  <p className="text-muted">{submission.freeText}</p>
                </div>
              )}

              <a
                className="btn btn-lg w-100 mt-3"
                href="#" // Placeholder for actual learning resources link
                style={{ backgroundColor: '#66CCBB', color: 'white', borderColor: '#66CCBB' }}
              >
                <i className="bi bi-compass-fill me-2"></i>Explore Learning Paths
              </a>
              <Link
                className="btn btn-link text-decoration-none mt-3 text-muted w-100"
                to="/"
              >
                <i className="bi bi-arrow-repeat me-2"></i>Take the Survey Again
              </Link>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
