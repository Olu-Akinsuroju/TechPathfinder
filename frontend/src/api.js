import axios from 'axios';

// Define the base URL for the backend API
// When the backend is live, this should be its actual URL.
// For local development with a backend server running on port 5000:
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Example of an API function that would be used by components.
// The actual implementation of this in ResultPage.jsx is currently a placeholder.
export const getLatestSubmission = async (userId) => {
  // When backend is ready, this would be:
  // return apiClient.get(`/submissions/latest?userId=${userId}`);

  // For now, simulate the placeholder logic directly in ResultPage.jsx or here.
  // To keep ResultPage.jsx's current placeholder logic intact for this step,
  // this file primarily serves to set up the apiClient.
  // The actual call from ResultPage will be refactored later to use this.

  // Placeholder data to demonstrate structure if we were calling from here
  const placeholderData = {
    id: "apiFileAbc123",
    nameOrEmail: "apiuser@example.com",
    freeText: "I love building Unity games from api.js!",
    method: "hard",
    assignedLabel: "Game Development",
    pathDescription: "API: Dive into creating interactive experiences...",
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  // console.log("Simulating API call via api.js for userId:", userId);
  // To show this file is used, let's return a slightly different placeholder
  // if we decide to call it. However, ResultPage.jsx already has its own.
  // For this step, the existence of apiClient is the main goal.
  // We will not yet modify ResultPage.jsx to import from here,
  // to keep this step focused on creating api.js.

  // This function won't be directly called by ResultPage in *this specific subtask*
  // but is here as a template for future backend integration.
  // ResultPage.jsx will continue to use its internal placeholder for now.
  return placeholderData; // This line is more for linting/completeness of the example function
};

// Add this new function
export const submitSurveyData = async (surveyData) => {
  try {
    const response = await apiClient.post('/submissions', surveyData);
    return response.data; // Axios wraps the response in a 'data' object
  } catch (error) {
    // Handle and re-throw or return a structured error
    // Axios errors have a 'response' object for server errors (e.g., error.response.data)
    // and 'request' object for network errors.
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      throw new Error(error.response.data.message || 'Server error during submission.');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', error.request);
      throw new Error('No response from server. Please check your network.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Setup Error:', error.message);
      throw new Error('Error setting up request: ' + error.message);
    }
  }
};

export const getSubmissionById = async (submissionId) => {
  if (!submissionId) {
    throw new Error('Submission ID is required.');
  }
  try {
    const response = await apiClient.get(`/submissions/${submissionId}`);
    return response.data; // Axios wraps the response in a 'data' object
  } catch (error) {
    if (error.response) {
      // Server responded with a status code out of 2xx range
      console.error('API Error Response (getSubmissionById):', error.response.data);
      throw new Error(error.response.data.message || `Failed to fetch submission ${submissionId}. Server responded with ${error.response.status}.`);
    } else if (error.request) {
      // Request was made but no response received
      console.error('API No Response (getSubmissionById):', error.request);
      throw new Error('No response from server while fetching submission. Please check your network.');
    } else {
      // Something else happened
      console.error('API Request Setup Error (getSubmissionById):', error.message);
      throw new Error('Error setting up request to fetch submission: ' + error.message);
    }
  }
};

export default apiClient;
