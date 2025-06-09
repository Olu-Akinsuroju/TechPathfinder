import 'bootstrap/dist/css/bootstrap.min.css'; // Must be first
import React from 'react';
import ReactDOM from 'react-dom/client';
// import 'bootstrap-icons/font/bootstrap-icons.css'; // Removed as bootstrap-icons package not explicitly installed in this phase
import App from './App.jsx';
import './index.css'; // Contains global styles, potentially overriding some Bootstrap defaults if needed

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
