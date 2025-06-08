import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import LandingPage from './pages/LandingPage'; // Replaced by SurveyForm at root
import SurveyForm from './components/SurveyForm';
import ResultPage from './pages/ResultPage';
import Header from './components/Header'; // Optional: a shared header

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
        <Header /> {/* Optional shared header */}
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<SurveyForm />} />
            <Route path="/result/:submissionId" element={<ResultPage />} />
            {/* Add other routes here if needed */}
          </Routes>
        </main>
        {/* Optional: a shared footer could go here */}
      </div>
    </Router>
  );
}

export default App;
