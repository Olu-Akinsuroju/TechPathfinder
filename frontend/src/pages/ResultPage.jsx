import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmissionById } from '../api';

// React-Bootstrap imports
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';

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
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" role="status" className="me-2" style={{width: '3rem', height: '3rem'}} />
        <span className="text-muted fs-5 align-middle">Loading results...</span>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-md-center">
          <Col md={8} lg={6}>
            <Alert variant="danger" className="text-center">
              <Alert.Heading as="h2">Error</Alert.Heading>
              <p>{error}</p>
              <hr />
              <div className="d-flex justify-content-center">
                <Button as={Link} to="/" variant="primary">
                  Back to Survey
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!submissionData) {
    return (
      <Container className="py-5 text-center">
         <Row className="justify-content-md-center">
          <Col md={8} lg={6}>
            <Alert variant="warning" className="text-center">
              <Alert.Heading as="h2">No Submission Data</Alert.Heading>
              <p>Could not retrieve submission details for ID: {submissionId}</p>
              <hr />
              <div className="d-flex justify-content-center">
                <Button as={Link} to="/" variant="primary">
                  Back to Survey
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  const matchType = submissionData.hardOrSoft === 'hard' ? 'Hard Match'
                  : submissionData.hardOrSoft === 'soft' ? 'Soft Match'
                  : 'Classification Method Unknown';
  const badgeBg = submissionData.hardOrSoft === 'hard' ? 'danger' : 'info';

  return (
    <Container className="py-5">
      <Row className="justify-content-md-center">
        <Col md={10} lg={8} xl={7}>
          <Card className="shadow-lg rounded-3 text-start">
            <Card.Header as="h1" className="text-center h2 fw-bold text-dark py-3">
              Your Tech Path Result
            </Card.Header>
            <Card.Body className="p-4 p-sm-5">
              <div className="text-center mb-4">
                <Badge bg={badgeBg} className="px-3 py-2 fs-6 rounded-pill">
                  {matchType}
                </Badge>
              </div>

              <div className="mb-4">
                <h2 className="h5 fw-semibold text-primary mb-2">Recommended Path:</h2>
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

              <hr className="my-4" />

              <h3 className="h6 fw-semibold mb-3">Summary of Your Inputs:</h3>
              {submissionData.motivation && (
                  <Row className="mb-2">
                      <Col sm={4} className="text-muted">Motivation:</Col>
                      <Col sm={8} className="text-body">{submissionData.motivation}</Col>
                  </Row>
              )}
              {submissionData.excitement && (
                  <Row className="mb-2">
                      <Col sm={4} className="text-muted">Exciting Activity:</Col>
                      <Col sm={8} className="text-body">{submissionData.excitement}</Col>
                  </Row>
              )}
              {submissionData.tools && submissionData.tools.length > 0 && (
                  <Row className="mb-2">
                      <Col sm={4} className="text-muted">Preferred Tools:</Col>
                      <Col sm={8} className="text-body">{submissionData.tools.join(', ')}</Col>
                  </Row>
              )}
               {submissionData.workEnvironment && (
                  <Row className="mb-2">
                      <Col sm={4} className="text-muted">Work Environment:</Col>
                      <Col sm={8} className="text-body">{submissionData.workEnvironment}</Col>
                  </Row>
              )}
              {submissionData.name && (
                  <Row className="mb-2">
                      <Col sm={4} className="text-muted">Name:</Col>
                      <Col sm={8} className="text-body">{submissionData.name}</Col>
                  </Row>
              )}


              <div className="d-grid mt-5">
                <Button as={Link} to="/" variant="primary" size="lg">
                  Take the Survey Again
                </Button>
              </div>
            </Card.Body>
            <Card.Footer className="text-center text-muted small py-3">
                Submission ID: {submissionId} <br/>
                Timestamp: {submissionData.timestamp ? new Date(submissionData.timestamp * 1000).toLocaleString() : 'N/A'}
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResultPage;
