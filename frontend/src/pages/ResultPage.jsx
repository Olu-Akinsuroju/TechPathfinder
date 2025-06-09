import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmissionById } from '../api';

// React-Bootstrap imports are removed

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
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted fs-5 mt-2">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="row justify-content-md-center">
          <div className="col-md-8 col-lg-6">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Error</h4>
              <p>{error}</p>
            </div>
            <Link className="btn btn-primary mt-3" to="/">Back to Survey</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!submissionData) {
    return (
      <div className="container py-5 text-center">
        <div className="row justify-content-md-center">
          <div className="col-md-8 col-lg-6">
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">No Submission Data</h4>
              <p>Could not retrieve submission details for ID: {submissionId}</p>
            </div>
            <Link className="btn btn-primary mt-3" to="/">Back to Survey</Link>
          </div>
        </div>
      </div>
    );
  }

  const matchTypeLabel = submissionData.hardOrSoft === 'hard' ? 'Hard Match'
                       : submissionData.hardOrSoft === 'soft' ? 'Soft Match'
                       : 'Classification Method Unknown';
  const badgeClass = `badge fs-5 px-3 py-2 rounded-pill ${submissionData.hardOrSoft === 'hard' ? 'bg-danger text-white' : 'bg-info text-dark'}`;


  return (
    <div className="container py-5">
      <div className="row justify-content-md-center">
        <div className="col-md-10 col-lg-8 col-xl-7">
          <div className="card shadow-lg rounded-3 text-start">
            <div className="card-header text-center py-3">
              <h1 className="h2 fw-bold text-dark mb-0">Your Tech Path Result</h1>
            </div>
            <div className="card-body p-4 p-sm-5">
              <div className="text-center mb-4">
                <span className={badgeClass}>{matchTypeLabel}</span>
              </div>

              <div className="mb-4">
                <h2 className="h5 fw-semibold text-primary mb-1">Recommended Path:</h2>
                <p className="display-6 text-dark fw-normal">{submissionData.assignedLabel || 'N/A'}</p>
              </div>

              {submissionData.whyCS && (
                <div className="mb-3">
                  <h3 className="h6 text-muted mb-1">You said (Why CS):</h3>
                  <p className="text-body fst-italic">"{submissionData.whyCS}"</p>
                </div>
              )}

              {submissionData.dreamProject && (
                <div className="mb-3">
                  <h3 className="h6 text-muted mb-1">Your Dream Project/Job:</h3>
                  <p className="text-body fst-italic">"{submissionData.dreamProject}"</p>
                </div>
              )}

              {(submissionData.motivation || submissionData.excitement || (submissionData.tools && submissionData.tools.length > 0) || submissionData.workEnvironment || submissionData.name) && (
                 <hr className="my-4" />
              )}

              {(submissionData.motivation || submissionData.excitement || (submissionData.tools && submissionData.tools.length > 0) || submissionData.workEnvironment || submissionData.name) && (
                <h3 className="h6 fw-semibold mb-3">Summary of Your Inputs:</h3>
              )}

              {submissionData.motivation && (
                  <div className="row mb-2">
                      <div className="col-sm-4 text-muted">Motivation:</div>
                      <div className="col-sm-8 text-body">{submissionData.motivation}</div>
                  </div>
              )}
              {submissionData.excitement && (
                  <div className="row mb-2">
                      <div className="col-sm-4 text-muted">Exciting Activity:</div>
                      <div className="col-sm-8 text-body">{submissionData.excitement}</div>
                  </div>
              )}
              {submissionData.tools && submissionData.tools.length > 0 && (
                  <div className="row mb-2">
                      <div className="col-sm-4 text-muted">Preferred Tools:</div>
                      <div className="col-sm-8 text-body">{submissionData.tools.join(', ')}</div>
                  </div>
              )}
               {submissionData.workEnvironment && (
                  <div className="row mb-2">
                      <div className="col-sm-4 text-muted">Work Environment:</div>
                      <div className="col-sm-8 text-body">{submissionData.workEnvironment}</div>
                  </div>
              )}
              {submissionData.name && (
                  <div className="row mb-2">
                      <div className="col-sm-4 text-muted">Name:</div>
                      <div className="col-sm-8 text-body">{submissionData.name}</div>
                  </div>
              )}

              <div className="d-grid mt-5">
                <Link className="btn btn-primary btn-lg" to="/">
                  Take the Survey Again
                </Link>
              </div>
            </div>
            <div className="card-footer text-muted small text-center py-3">
                <p className="mb-0">Submission ID: {submissionId}</p>
                <p className="mb-0">Timestamp: {submissionData.timestamp ? new Date(submissionData.timestamp * 1000).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
