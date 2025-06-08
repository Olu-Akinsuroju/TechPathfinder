import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitSurveyData } from '../api'; // Adjusted path

const SurveyForm = () => {
  const [formData, setFormData] = useState({
    whyComputerScience: '',
    motivation: '', // For radio buttons
    excitedActivity: '', // For radio buttons
    name: '', // Optional text input
    workEnvironment: '', // For radio buttons
    preferredTools: {
      'Excel/Tableau': false,
      'Photoshop/Figma': false,
      'Terminals/Security tools': false,
      'Game engines': false,
    },
    dreamProject: '' // Optional textarea, formerly projectDescription
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Added isLoading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleToolChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      preferredTools: {
        ...prevData.preferredTools,
        [name]: checked
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    // Why Computer Science (required)
    if (!formData.whyComputerScience.trim()) {
      newErrors.whyComputerScience = 'This field is required.';
    }

    // What motivated you to explore tech? (required)
    if (!formData.motivation) {
      newErrors.motivation = 'Please select a motivation.';
    }

    // Which activity excites you most? (required)
    if (!formData.excitedActivity) {
      newErrors.excitedActivity = 'Please select an activity.';
    }

    // Your ideal work environment involves: (required)
    if (!formData.workEnvironment) {
      newErrors.workEnvironment = 'Please select your ideal work environment.';
    }

    // Preferred tools: (required at least one)
    const selectedTools = Object.values(formData.preferredTools).filter(checked => checked);
    if (selectedTools.length === 0) {
      newErrors.preferredTools = 'Please select at least one tool.';
    }

    // Name (optional - no validation needed unless specific rules are added)
    // dreamProject (optional - no validation needed)

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
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // Stop submission if there are errors
    }
    setErrors({}); // Clear any previous errors

    setIsLoading(true); // Start loading
    const payload = {
      whyComputerScience: formData.whyComputerScience,
      motivation: formData.motivation,
      excitedActivity: formData.excitedActivity,
      name: formData.name, // Will be empty if not filled, backend should handle optionality
      workEnvironment: formData.workEnvironment,
      preferredTools: Object.entries(formData.preferredTools)
                          .filter(([tool, isSelected]) => isSelected)
                          .map(([tool]) => tool), // Send as an array of selected tool names
      dreamProject: formData.dreamProject, // Optional
      // Crucially, add the 'freeText' field for classification
      freeText: formData.dreamProject // Use dreamProject for classification
    };

    try {
      const result = await submitSurveyData(payload); // payload is already constructed

      if (result.status === 'ok' && result.submissionId) {
        navigate(`/result/${result.submissionId}`); // Changed from query parameter
      } else {
        // This case might be less likely if submitSurveyData throws errors for non-ok statuses,
        // but good to have a fallback.
        console.error('Submission successful, but API response was not as expected:', result);
        alert('Submission processed, but there was an issue redirecting. Please check your submissions.');
      }
    } catch (error) {
      // Errors thrown by submitSurveyData will be caught here
      console.error('Submission failed:', error);
      alert(`Submission failed: ${error.message || 'An unexpected error occurred.'}`);
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Discover Your Tech Path
        </h1>
        <p className="text-gray-500">
          Answer a few quick questions to see which tech career fits you best.
        </p>
      </div>

      <div className="max-w-2xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-8"> {/* Added space-y-8 for spacing between field groups */}
          {/* Why Computer Science */}
          <div className="mb-6"> {/* Consistent wrapper */}
            <label htmlFor="whyComputerScience" className="block text-gray-700 font-medium mb-2">Why Computer Science</label>
            <input
              type="text"
              id="whyComputerScience"
              name="whyComputerScience"
              value={formData.whyComputerScience}
              onChange={handleChange}
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.whyComputerScience ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.whyComputerScience && <p className="text-red-600 mt-1">{errors.whyComputerScience}</p>}
          </div>

          {/* Motivation */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">What motivated you to explore tech?</label>
            <div className={`flex flex-wrap gap-4 md:grid md:grid-cols-2 md:gap-6 border rounded-lg p-3 ${errors.motivation ? 'border-red-500' : 'border-transparent'}`}>
              {[
                "High salary", "Creative expression", "Problem-solving",
                "Data analysis", "Security", "Automation",
                "Entrepreneurship", "Gaming"
              ].map(option => (
                <label key={option} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    id={`motivation-${option}`}
                    name="motivation"
                    value={option}
                    checked={formData.motivation === option}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-indigo-500"></div>
                  <span className="text-gray-700 peer-checked:text-gray-900">{option}</span>
                </label>
              ))}
            </div>
            {errors.motivation && <p className="text-red-600 mt-1">{errors.motivation}</p>}
          </div>

          {/* Excited Activity */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Which activity excites you most?</label>
            <div className={`flex flex-wrap gap-4 md:grid md:grid-cols-2 md:gap-6 border rounded-lg p-3 ${errors.excitedActivity ? 'border-red-500' : 'border-transparent'}`}>
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
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    id={`excitedActivity-${option.value}`}
                    name="excitedActivity"
                    value={option.value}
                    checked={formData.excitedActivity === option.value}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-indigo-500"></div>
                  <span className="text-gray-700 peer-checked:text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.excitedActivity && <p className="text-red-600 mt-1">{errors.excitedActivity}</p>}
          </div>

          {/* Name */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} // Assuming 'name' could have errors if it were required
            />
            {/* Optional field, error display can be added if specific validation for format is needed */}
          </div>

          {/* Work Environment */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Your ideal work environment involves:</label>
            <div className={`flex flex-wrap gap-4 md:grid md:grid-cols-2 md:gap-6 border rounded-lg p-3 ${errors.workEnvironment ? 'border-red-500' : 'border-transparent'}`}>
              {[
                "Solo deep work", "Team collaboration",
                "Fast-paced hacking", "Visual creativity"
              ].map(option => (
                <label key={option} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    id={`workEnvironment-${option}`}
                    name="workEnvironment"
                    value={option}
                    checked={formData.workEnvironment === option}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-indigo-500"></div>
                  <span className="text-gray-700 peer-checked:text-gray-900">{option}</span>
                </label>
              ))}
            </div>
            {errors.workEnvironment && <p className="text-red-600 mt-1">{errors.workEnvironment}</p>}
          </div>

          {/* Preferred Tools */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Preferred tools:</label>
            <div className={`flex flex-wrap gap-4 border rounded-lg p-3 ${errors.preferredTools ? 'border-red-500' : 'border-transparent'}`}>
              {Object.keys(formData.preferredTools).map(toolName => (
                <label key={toolName} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id={`preferredTools-${toolName}`}
                    name={toolName} // Corresponds to the key in formData.preferredTools
                    checked={formData.preferredTools[toolName]}
                    onChange={handleToolChange}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded-sm border-2 border-gray-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition flex items-center justify-center peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-indigo-500">
                    {/* Optional: Add an SVG checkmark here, conditionally rendered */}
                    {formData.preferredTools[toolName] && (
                       <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    )}
                  </div>
                  <span className="text-gray-700 peer-checked:text-gray-900">{toolName}</span>
                </label>
              ))}
            </div>
            {errors.preferredTools && <p className="text-red-600 mt-1">{errors.preferredTools}</p>}
          </div>

          {/* Dream Project */}
          <div className="mb-6">
            <label htmlFor="dreamProject" className="block text-gray-700 font-medium mb-2">Describe a project you’d love to build in 1–2 sentences/dream Job</label>
            <textarea
              id="dreamProject"
              name="dreamProject"
              value={formData.dreamProject}
              onChange={handleChange}
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.dreamProject ? 'border-red-500' : 'border-gray-300'}`}
              rows="3" // Added rows attribute for better textarea default size
            />
            {/* Optional field */}
          </div>

          <button
            type="submit"
            disabled={!isFormComplete()}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-2xl shadow-md transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-indigo-600"
          >
            See My Path
          </button>
        </form>
      </div>
      {isLoading && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
          {/* <p className="text-white text-lg ml-4">Loading...</p> */} {/* Optional loading text */}
        </div>
      )}
    </div>
  );
};

export default SurveyForm;
