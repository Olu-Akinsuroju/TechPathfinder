import React from 'react';
// Removed Link component as it's not used in the new form-based page
// import { Link } from 'react-router-dom';

const LandingPage = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission logic here
    // For now, just log to console
    console.log('Form submitted');
    // In a real app, you might navigate to the results page or send data to a backend
    // For example: navigate('/result');
  };

  return (
    <div className="bg-light min-vh-100 py-5"> {/* Ensure full page height and apply bg-light */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-7">
            <div className="card shadow-lg rounded-4 p-4 p-md-5"> {/* Added p-4 p-md-5 for padding */}
              <h2 className="text-center mb-4 fw-bold" style={{ color: '#66CCBB' }}>
                Find Your Tech Path
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Section 1: Project Ideas */}
                <div className="mb-4">
                  <h3 className="fs-5 fw-semibold mb-3">
                    <i className="bi bi-lightbulb fs-5 me-2" style={{ color: '#66CCBB' }}></i>
                    Project Ideas & Interests
                  </h3>
                  <div className="mb-3">
                    <label htmlFor="projectIdeas" className="form-label fw-semibold">
                      Describe a project you'd love to build or a problem you're passionate about solving.
                    </label>
                    <small className="form-text text-muted d-block mb-2">
                      Think about what excites you. It could be a web app, a mobile game, a data analysis tool, etc.
                    </small>
                    <textarea className="form-control" id="projectIdeas" rows="3" placeholder="e.g., A website to connect local artists, an app to track fitness goals..."></textarea>
                  </div>
                </div>

                {/* Section 2: Tools & Technologies */}
                <div className="mb-4">
                  <h3 className="fs-5 fw-semibold mb-3">
                    <i className="bi bi-tools fs-5 me-2" style={{ color: '#66CCBB' }}></i>
                    Tools & Technologies
                  </h3>
                  <label className="form-label fw-semibold">
                    Which of these areas or tools sound interesting to you?
                  </label>
                  <small className="form-text text-muted d-block mb-2">
                    Select any that catch your eye. No prior experience needed!
                  </small>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" value="" id="checkWeb" />
                    <label className="form-check-label" htmlFor="checkWeb">
                      Building websites (HTML, CSS, JavaScript)
                    </label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" value="" id="checkMobile" />
                    <label className="form-check-label" htmlFor="checkMobile">
                      Creating mobile apps (iOS or Android)
                    </label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" value="" id="checkData" />
                    <label className="form-check-label" htmlFor="checkData">
                      Working with data (Databases, AI, Machine Learning)
                    </label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" value="" id="checkGames" />
                    <label className="form-check-label" htmlFor="checkGames">
                      Developing video games
                    </label>
                  </div>
                </div>

                {/* Section 3: Motivation & Learning Style */}
                <div className="mb-4">
                  <h3 className="fs-5 fw-semibold mb-3">
                    <i className="bi bi-emoji-smile fs-5 me-2" style={{ color: '#66CCBB' }}></i>
                    Motivation & Learning Style
                  </h3>
                  <label htmlFor="motivation" className="form-label fw-semibold">
                    What motivates you to explore technology?
                  </label>
                  <small className="form-text text-muted d-block mb-2">
                    Choose the option that best describes you.
                  </small>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="motivationRadio" id="radioCreative" />
                    <label className="form-check-label" htmlFor="radioCreative">
                      I want to be creative and build new things.
                    </label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="motivationRadio" id="radioProblemSolver" />
                    <label className="form-check-label" htmlFor="radioProblemSolver">
                      I enjoy solving complex problems.
                    </label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="motivationRadio" id="radioCareer" />
                    <label className="form-check-label" htmlFor="radioCareer">
                      I'm looking for new career opportunities.
                    </label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="motivationRadio" id="radioCuriosity" />
                    <label className="form-check-label" htmlFor="radioCuriosity">
                      I'm just curious and love learning!
                    </label>
                  </div>
                </div>

                <div className="d-grid"> {/* Use d-grid for full-width button behavior if desired, or remove for default button width */}
                  <button
                    type="submit"
                    className="btn w-100 shadow-sm py-2"
                    style={{ backgroundColor: '#66CCBB', color: 'white', borderColor: '#66CCBB' }}
                  >
                    See My Path
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
