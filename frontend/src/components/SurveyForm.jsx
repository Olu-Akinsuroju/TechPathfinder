import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitSurveyData } from '../api';

// React-Bootstrap imports
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';

const SurveyForm = () => {
  const [formData, setFormData] = useState({
    whyComputerScience: '',
    motivation: '',
    excitedActivity: '',
    name: '',
    workEnvironment: '',
    preferredTools: {
      'Excel/Tableau': false,
      'Photoshop/Figma': false,
      'Terminals/Security tools': false,
      'Game engines': false,
    },
    dreamProject: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleToolChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      preferredTools: {
        ...prevData.preferredTools,
        [name]: checked,
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.whyComputerScience.trim()) newErrors.whyComputerScience = 'This field is required.';
    if (!formData.motivation) newErrors.motivation = 'Please select a motivation.';
    if (!formData.excitedActivity) newErrors.excitedActivity = 'Please select an activity.';
    if (!formData.workEnvironment) newErrors.workEnvironment = 'Please select your ideal work environment.';
    const selectedTools = Object.values(formData.preferredTools).filter(checked => checked);
    if (selectedTools.length === 0) newErrors.preferredTools = 'Please select at least one tool.';
    return newErrors;
  };

  const isFormComplete = () => {
    if (!formData.whyComputerScience.trim()) return false;
    if (!formData.motivation) return false;
    if (!formData.excitedActivity) return false;
    if (!formData.workEnvironment) return false;
    const selectedTools = Object.values(formData.preferredTools).filter(checked => checked);
    if (selectedTools.length === 0) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors); // Set errors for react-bootstrap to use

    if (Object.keys(validationErrors).length > 0) {
      return; // Stop submission if there are errors
    }

    // If no errors, clear errors state (optional, as isInvalid checks existence)
    // setErrors({});

    setIsLoading(true);
    const payload = {
      whyComputerScience: formData.whyComputerScience,
      motivation: formData.motivation,
      excitedActivity: formData.excitedActivity,
      name: formData.name,
      workEnvironment: formData.workEnvironment,
      preferredTools: Object.entries(formData.preferredTools)
                          .filter(([, isSelected]) => isSelected)
                          .map(([tool]) => tool),
      dreamProject: formData.dreamProject,
      freeText: formData.dreamProject,
    };

    try {
      const result = await submitSurveyData(payload);
      if (result.status === 'ok' && result.submissionId) {
        navigate(`/result/${result.submissionId}`);
      } else {
        console.error('Submission successful, but API response was not as expected:', result);
        alert('Submission processed, but there was an issue redirecting. Please check your submissions.');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      alert(`Submission failed: ${error.message || 'An unexpected error occurred.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if the form has been touched for validation feedback only after first submit attempt
  const formValidated = Object.keys(errors).length > 0;


  return (
    <>
      <Container className="text-center py-4">
        <h1 className="display-4 mb-3">Discover Your Tech Path</h1>
        <p className="lead text-muted">
          Answer a few quick questions to see which tech career fits you best.
        </p>
      </Container>

      <Container className="py-5">
        <Row className="justify-content-md-center">
          <Col md={10} lg={8} xl={7}> {/* Adjusted Col for better width control */}
            <Card className="shadow-lg rounded-3"> {/* Bootstrap rounded-3 is larger */}
              <Card.Body className="p-4 p-sm-5">
                <Form noValidate validated={formValidated} onSubmit={handleSubmit}>
                  {/* Why Computer Science */}
                  <Form.Group className="mb-4" controlId="whyComputerScience">
                    <Form.Label className="fw-semibold">Why Computer Science</Form.Label>
                    <Form.Control
                      type="text"
                      name="whyComputerScience"
                      value={formData.whyComputerScience}
                      onChange={handleChange}
                      required
                      isInvalid={!!errors.whyComputerScience}
                      placeholder="e.g., I love solving complex problems..."
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.whyComputerScience}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Motivation */}
                  <Form.Group className="mb-4" controlId="motivation">
                    <Form.Label className="fw-semibold">What motivated you to explore tech?</Form.Label>
                    <div className="mt-2"> {/* Wrapper for options */}
                      {["High salary", "Creative expression", "Problem-solving", "Data analysis", "Security", "Automation", "Entrepreneurship", "Gaming"].map(option => (
                        <Form.Check
                          type="radio"
                          inline
                          key={option}
                          id={`motivation-${option}`}
                          name="motivation"
                          value={option}
                          label={option}
                          checked={formData.motivation === option}
                          onChange={handleChange}
                          isInvalid={!!errors.motivation}
                          // Feedback for radios is often handled at group level
                        />
                      ))}
                    </div>
                    {errors.motivation && <div className="d-block invalid-feedback">{errors.motivation}</div>}
                  </Form.Group>

                  {/* Excited Activity */}
                  <Form.Group className="mb-4" controlId="excitedActivity">
                    <Form.Label className="fw-semibold">Which activity excites you most?</Form.Label>
                     <div className="mt-2">
                      {[
                        { value: "Designing interfaces", label: "Designing interfaces → UI/UX" },
                        { value: "Building websites", label: "Building websites → Web Dev" },
                        { value: "Analyzing datasets", label: "Analyzing datasets → Data Science/Engineering" },
                        { value: "Securing systems", label: "Securing systems → Cybersecurity" },
                        { value: "Training AI models", label: "Training AI models → AI/ML" },
                        { value: "Developing mobile apps", label: "Developing mobile apps → Mobile Dev" },
                        { value: "Creating games", label: "Creating games → Game Dev" },
                        { value: "Writing algorithms", label: "Writing algorithms → General Programming" },
                        { value: "Managing servers", label: "Managing servers → Cloud Computing" }
                      ].map(option => (
                        <Form.Check
                          type="radio"
                          key={option.value}
                          id={`excitedActivity-${option.value}`}
                          name="excitedActivity"
                          value={option.value}
                          label={option.label}
                          checked={formData.excitedActivity === option.value}
                          onChange={handleChange}
                          isInvalid={!!errors.excitedActivity}
                        />
                      ))}
                    </div>
                    {errors.excitedActivity && <div className="d-block invalid-feedback">{errors.excitedActivity}</div>}
                  </Form.Group>

                  {/* Name */}
                  <Form.Group className="mb-4" controlId="name">
                    <Form.Label className="fw-semibold">Name <span className="text-muted">(Optional)</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      isInvalid={!!errors.name} // In case validation is added later
                      placeholder="Your Name"
                    />
                     <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Work Environment */}
                  <Form.Group className="mb-4" controlId="workEnvironment">
                    <Form.Label className="fw-semibold">Your ideal work environment involves:</Form.Label>
                    <div className="mt-2">
                      {["Solo deep work", "Team collaboration", "Fast-paced hacking", "Visual creativity"].map(option => (
                        <Form.Check
                          type="radio"
                          inline
                          key={option}
                          id={`workEnvironment-${option}`}
                          name="workEnvironment"
                          value={option}
                          label={option}
                          checked={formData.workEnvironment === option}
                          onChange={handleChange}
                          isInvalid={!!errors.workEnvironment}
                        />
                      ))}
                    </div>
                     {errors.workEnvironment && <div className="d-block invalid-feedback">{errors.workEnvironment}</div>}
                  </Form.Group>

                  {/* Preferred Tools */}
                  <Form.Group className="mb-4" controlId="preferredTools">
                    <Form.Label className="fw-semibold">Preferred tools: <span className="text-muted">(Select at least one)</span></Form.Label>
                    <div className="mt-2">
                      {Object.keys(formData.preferredTools).map(toolName => (
                        <Form.Check
                          type="checkbox"
                          inline
                          key={toolName}
                          id={`preferredTools-${toolName}`}
                          name={toolName}
                          label={toolName}
                          checked={formData.preferredTools[toolName]}
                          onChange={handleToolChange}
                          isInvalid={!!errors.preferredTools}
                        />
                      ))}
                    </div>
                    {errors.preferredTools && <div className="d-block invalid-feedback">{errors.preferredTools}</div>}
                  </Form.Group>

                  {/* Dream Project */}
                  <Form.Group className="mb-4" controlId="dreamProject">
                    <Form.Label className="fw-semibold">Describe a project you’d love to build in 1–2 sentences/dream Job <span className="text-muted">(Optional)</span></Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="dreamProject"
                      value={formData.dreamProject}
                      onChange={handleChange}
                      isInvalid={!!errors.dreamProject} // In case validation is added later
                      placeholder="e.g., A mobile app that helps people learn new languages..."
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.dreamProject}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-grid mt-5">
                    <Button variant="primary" size="lg" type="submit" disabled={!isFormComplete() || isLoading}>
                      {isLoading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                          Submitting...
                        </>
                      ) : (
                        "See My Path"
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999, // High z-index to be on top
        }}>
          <Spinner animation="border" variant="light" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
    </>
  );
};

export default SurveyForm;
