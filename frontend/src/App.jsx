import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ResultPage from './pages/ResultPage';
import Header from './components/Header'; // Optional: a shared header

function App() {
  return (
    <Router>
      {/* Applied Bootstrap's bg-light equivalent for global page background */}
      <div className="min-h-screen bg-light text-slate-800 flex flex-col"> {/* Changed bg-slate-50 to bg-light */}
        <Header /> {/* Optional shared header */}
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/result" element={<ResultPage />} />
            {/* Add other routes here if needed */}
          </Routes>
        </main>
        {/* Optional: a shared footer could go here */}
      </div>
    </Router>
  );
}

export default App;
