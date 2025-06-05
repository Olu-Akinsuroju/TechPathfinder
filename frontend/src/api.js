import axios from 'axios';

// Define the base URL for the backend API
// When the backend is live, this should be its actual URL.
// For local development with a backend server running on port 5000:
const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000/api'
  : '/api'; // For production, assuming frontend is served with backend or proxied

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

export default apiClient;
