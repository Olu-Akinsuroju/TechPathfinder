import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitSurveyData } from '../api';

// Removed React-Bootstrap imports

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
  const [formValidated, setFormValidated] = useState(false); // For Bootstrap's .was-validated
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
    setFormValidated(false); // Reset for next validation display
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setFormValidated(true); // Enable Bootstrap's .was-validated styles
      return;
    }

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

  const motivationOptions = ["High salary", "Creative expression", "Problem-solving", "Data analysis", "Security", "Automation", "Entrepreneurship", "Gaming"];
  const excitedActivityOptions = [
    { value: "Designing interfaces", label: "Designing interfaces → UI/UX" },
    { value: "Building websites", label: "Building websites → Web Dev" },
    { value: "Analyzing datasets", label: "Analyzing datasets → Data Science/Engineering" },
    { value: "Securing systems", label: "Securing systems → Cybersecurity" },
    { value: "Training AI models", label: "Training AI models → AI/ML" },
    { value: "Developing mobile apps", label: "Developing mobile apps → Mobile Dev" },
    { value: "Creating games", label: "Creating games → Game Dev" },
    { value: "Writing algorithms", label: "Writing algorithms → General Programming" },
    { value: "Managing servers", label: "Managing servers → Cloud Computing" }
  ];
  const workEnvironmentOptions = ["Solo deep work", "Team collaboration", "Fast-paced hacking", "Visual creativity"];


  return (
    <>
      {/* Old header removed */}
      <div className="container my-5"> {/* Changed py-5 to my-5 */}
        <div className="row justify-content-md-center">
          <div className="col-md-10 col-lg-8 col-xl-7">
            <h2 className="text-center mb-4 fw-bold text-primary">Find Your Tech Path</h2> {/* New Heading */}
            <div className="card shadow-sm rounded bg-light border-0"> {/* Modified card classes */}
              <div className="card-body p-4"> {/* Modified card-body padding */}
                <form noValidate onSubmit={handleSubmit} className={formValidated ? 'was-validated' : ''}>
                  {/* Why Computer Science */}
                  <div className="mb-4">
                    <label htmlFor="whyComputerScience" className="form-label fw-semibold">Why Computer Science</label>
                    <input
                      type="text"
                      id="whyComputerScience"
                      name="whyComputerScience"
                      className={`form-control form-control-lg ${errors.whyComputerScience ? 'is-invalid' : ''}`}
                      value={formData.whyComputerScience}
                      onChange={handleChange}
                      required
                      placeholder="e.g., I love solving complex problems..."
                    />
                    {errors.whyComputerScience && <div className="invalid-feedback">{errors.whyComputerScience}</div>}
                  </div>

                  {/* Motivation */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">What motivated you to explore tech?</label>
                    <div className="mt-2">
                      {motivationOptions.map(option => (
                        <div className="form-check form-check-inline" key={option}>
                          <input
                            className={`form-check-input ${errors.motivation ? 'is-invalid' : ''}`}
                            type="radio"
                            name="motivation"
                            id={`motivation-${option.replace(/\s+/g, '-')}`} // Create valid ID
                            value={option}
                            checked={formData.motivation === option}
                            onChange={handleChange}
                            required
                          />
                          <label className="form-check-label" htmlFor={`motivation-${option.replace(/\s+/g, '-')}`}>{option}</label>
                        </div>
                      ))}
                    </div>
                    {errors.motivation && <div className="d-block invalid-feedback mb-2">{errors.motivation}</div>}
                  </div>

                  {/* Excited Activity */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Which activity excites you most?</label>
                     <div className="mt-2 row"> {/* Using row for better layout of potentially long labels */}
                      {excitedActivityOptions.map(option => (
                        <div className="col-md-6" key={option.value}> {/* Two columns on medium screens */}
                          <div className="form-check">
                            <input
                              className={`form-check-input ${errors.excitedActivity ? 'is-invalid' : ''}`}
                              type="radio"
                              name="excitedActivity"
                              id={`excitedActivity-${option.value.replace(/\s+/g, '-')}`}
                              value={option.value}
                              checked={formData.excitedActivity === option.value}
                              onChange={handleChange}
                              required
                            />
                            <label className="form-check-label" htmlFor={`excitedActivity-${option.value.replace(/\s+/g, '-')}`}>{option.label}</label>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.excitedActivity && <div className="d-block invalid-feedback mb-2">{errors.excitedActivity}</div>}
                  </div>

                  {/* Name */}
                  <div className="mb-4">
                    <label htmlFor="name" className="form-label fw-semibold">Name <span className="text-muted">(Optional)</span></label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`form-control form-control-lg ${errors.name ? 'is-invalid' : ''}`}
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                    />
                     {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  {/* Work Environment */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Your ideal work environment involves:</label>
                    <div className="mt-2">
                      {workEnvironmentOptions.map(option => (
                        <div className="form-check form-check-inline" key={option}>
                          <input
                            className={`form-check-input ${errors.workEnvironment ? 'is-invalid' : ''}`}
                            type="radio"
                            name="workEnvironment"
                            id={`workEnvironment-${option.replace(/\s+/g, '-')}`}
                            value={option}
                            checked={formData.workEnvironment === option}
                            onChange={handleChange}
                            required
                          />
                          <label className="form-check-label" htmlFor={`workEnvironment-${option.replace(/\s+/g, '-')}`}>{option}</label>
                        </div>
                      ))}
                    </div>
                    {errors.workEnvironment && <div className="d-block invalid-feedback mb-2">{errors.workEnvironment}</div>}
                  </div>

                  {/* Preferred Tools */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Preferred tools: <span className="text-muted">(Select at least one)</span></label>
                    <div className="mt-2">
                      {Object.keys(formData.preferredTools).map(toolName => (
                        <div className="form-check form-check-inline" key={toolName}>
                          <input
                            className={`form-check-input ${errors.preferredTools ? 'is-invalid' : ''}`}
                            type="checkbox"
                            name={toolName}
                            id={`preferredTools-${toolName.replace(/\W/g, '-')}`} // Sanitize ID
                            checked={formData.preferredTools[toolName]}
                            onChange={handleToolChange}
                            // 'required' for a group of checkboxes is handled by validateForm
                          />
                          <label className="form-check-label" htmlFor={`preferredTools-${toolName.replace(/\W/g, '-')}`}>{toolName}</label>
                        </div>
                      ))}
                    </div>
                     {errors.preferredTools && <div className="d-block invalid-feedback mb-2">{errors.preferredTools}</div>}
                  </div>

                  {/* Dream Project */}
                  <div className="mb-4">
                    <label htmlFor="dreamProject" className="form-label fw-semibold">Describe a project you’d love to build in 1–2 sentences/dream Job <span className="text-muted">(Optional)</span></label>
                    <textarea
                      id="dreamProject"
                      name="dreamProject"
                      className={`form-control form-control-lg ${errors.dreamProject ? 'is-invalid' : ''}`}
                      rows={3}
                      value={formData.dreamProject}
                      onChange={handleChange}
                      placeholder="e.g., A mobile app that helps people learn new languages..."
                    />
                    {errors.dreamProject && <div className="invalid-feedback">{errors.dreamProject}</div>}
                  </div>

                  <div className="d-grid mt-5">
                    <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold shadow-sm" disabled={!isFormComplete() || isLoading}>
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Submitting...
                        </>
                      ) : (
                        "See My Path"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          zIndex: 9999,
        }}>
          <div className="spinner-border text-light" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default SurveyForm;
