# Tech Pathfinder

This project helps users discover suitable tech career paths based on their interests and motivations, as expressed through a survey. It uses a combination of rule-based classification and AI-driven soft classification to suggest a relevant "Tech Path".

## Features

-   Interactive survey form for users to input their preferences.
-   Backend API to receive survey submissions.
-   Rule-based ("hard") classification for direct matches.
-   AI-powered ("soft") classification using a local transformer model for nuanced inputs.
-   Displays the classified Tech Path and related information to the user.
-   In-memory data storage for submissions (no external database required for core functionality).

## Legacy Features Note
Note: This application previously used Google Forms for data input, Google Sheets for data storage, and Google Apps Script for automation. This integration has been removed. The current version uses an in-site survey form and a direct backend API for processing submissions.

## Full Stack Application Setup

### Overview

This project consists of a Python backend (Flask API) and a React frontend.
- The **backend** receives survey submissions, classifies the text in these responses using hard-rules and a local AI model, and exposes API endpoints for submissions and results.
- The **frontend** provides a user interface for the survey and to view the classified Tech Path.

### Prerequisites

-   Python 3.x
-   Node.js and Yarn (or npm)

### Backend Setup

The backend is a Python application that includes a Flask API server.

1.  **Navigate to the Backend Directory:**
    ```bash
    cd backend
    ```

2.  **Create a Python Virtual Environment (Recommended):**
    It is highly recommended to use a Python virtual environment.
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
    (Please run these commands manually in your local terminal if using a virtual environment.)

3.  **Install Dependencies:**
    Ensure all dependencies listed in `requirements.txt` are installed (into your virtual environment if using one):
    ```bash
    pip install -r requirements.txt
    ```
    This includes Flask, Flask-CORS, transformers, torch, python-dotenv.

4.  **Environment Variables:**
    No critical environment variables are strictly required for the current core functionality to work (submission classification and display). The application uses an in-memory data store. Standard environment variables for Flask/Python development (e.g., `FLASK_ENV`, `PYTHONUNBUFFERED`) or for specific deployment platforms can be used as needed. The backend loads variables from a `.env` file if present in the `backend` directory (e.g., for classifier model configurations if externalized, though not currently the case).

5.  **Running the Backend:**
    *   **For local development:**
        From the `backend` directory:
        ```bash
        python poller.py
        ```
        The Flask API server will start, typically on `http://localhost:5000`.
    *   **For production (example with Gunicorn):**
        From the `backend` directory, ensure Gunicorn is installed (`pip install gunicorn`).
        ```bash
        gunicorn poller:app --bind 0.0.0.0:$PORT
        ```
        Replace `$PORT` with the desired port number (e.g., 8000). Render typically sets this automatically.

6.  **Testing the Backend API Endpoints:**
    Once the backend is running, you can test the API endpoints.
    *   Health check:
        ```bash
        curl "http://localhost:5000/api/health"
        ```
    *   Submit data (example using a simplified payload):
        ```bash
        curl -X POST -H "Content-Type: application/json" -d '{"freeText": "I want to build games."}' "http://localhost:5000/api/submissions"
        ```
    *   Retrieve a submission (replace `:submissionId` with an actual ID from a POST response):
        ```bash
        curl "http://localhost:5000/api/submissions/:submissionId"
        ```

### Frontend Setup

The frontend is a React application built with Vite.

1.  **Navigate to the Frontend Directory:**
    From the project root:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies:**
    If this is the first time or `node_modules` is missing:
    ```bash
    yarn install
    ```

3.  **Running the Frontend Development Server:**
    ```bash
    yarn dev
    ```
    This will start the Vite development server, typically on `http://localhost:5173` (the exact port will be shown in your console). Open this URL in your web browser.

4.  **Frontend Environment Variables:**
    The frontend is configured in `frontend/src/api.js` to connect to `http://localhost:5000/api` during development. For production builds, if the backend API is on a different domain, you might configure `VITE_API_BASE_URL` in `/frontend/.env`. For same-origin deployments or proxied setups, this might not be necessary.

### End-to-End Workflow

1.  Start the backend: `cd backend && python poller.py` (adjust for virtual environment).
2.  Start the frontend: `cd frontend && yarn dev`.
3.  Open the frontend URL (e.g., `http://localhost:5173`) in your browser.
4.  Fill out and submit the survey.
5.  You should be redirected to a results page displaying your classified Tech Path.

## Modifying Hard Classification Rules

The rule-based ("hard") classifier maps specific keywords or phrases found in the user's free-text answers to predefined Tech Paths. These rules are defined in the `HARD_RULES` dictionary within the `/backend/ai_model/hard_classifier.py` file.

### How to Add or Modify Keywords

1.  **Open the Classifier File:**
    Navigate to and open `/backend/ai_model/hard_classifier.py`.

2.  **Locate `HARD_RULES`:**
    You will find a Python dictionary named `HARD_RULES`. It looks like this:

    ```python
    HARD_RULES: Dict[str, str] = {
        "game engines": "Game Development",
        "cloud computing": "DevOps/Cloud",
        "python ml": "Data Science/AI",
        # ... many more rules
    }
    ```

3.  **Edit the Rules:**
    *   **To add a new rule:** Add a new key-value pair to the dictionary. The key is the keyword/phrase (string, will be matched case-insensitively) and the value is the Tech Path (string) it maps to.
        ```python
        "your new keyword phrase": "Desired Tech Path",
        ```
    *   **To modify an existing rule:** Change the keyword/phrase or the Tech Path for an existing entry.
    *   **To remove a rule:** Delete the key-value pair from the dictionary.

4.  **Keyword Specificity and Order:**
    *   The matching is case-insensitive.
    *   The classifier uses regular expressions with word boundaries (`\b`) to match whole words or phrases. For example, a rule for "ai" will match "ai" but not "train".
    *   Rules are sorted by the length of the keyword phrase (longest first) before matching. This helps ensure that more specific, longer phrases (e.g., "python machine learning") are matched before shorter, more general ones (e.g., "python").

5.  **Save and Test:**
    *   After making changes, save the `hard_classifier.py` file.
    *   It's highly recommended to add or update unit tests in `/backend/tests/test_hard_classifier.py` to verify your new rules work as expected and haven't introduced regressions.
    *   Run the tests: `cd backend && python -m unittest discover tests` (or run specific test files).
    *   You can also run the application and submit survey entries to see the classification in action.

**Example: Adding a rule for "quantum computing"**

```python
HARD_RULES: Dict[str, str] = {
    "game engines": "Game Development",
    "cloud computing": "DevOps/Cloud",
    # ... existing rules ...
    "quantum computing": "Future Technologies", # New rule added
    # ... more existing rules ...
}
```

Remember to choose Tech Paths that are consistent with your project's defined categories.

### AI Soft Classification

If a free-text answer from the survey does not match any of the predefined keywords in the "hard" classifier, the system attempts a "soft" classification using a local AI model.

-   **Technology:** This feature utilizes the Hugging Face `transformers` library and a pre-trained model (`facebook/distilbart-mnli`) for zero-shot text classification.
-   **Local Model:** The model runs entirely locally. **No external API tokens (e.g., for Hugging Face API) are required for this specific model.**
-   **Automatic Download & Caching:**
    -   When the application runs for the first time and the soft classifier is needed, the `transformers` library will automatically download the `facebook/distilbart-mnli` model (a few hundred MBs). This might take a few minutes depending on your internet connection.
    -   The downloaded model is then cached locally on your machine, typically in `~/.cache/huggingface/hub/` (the exact path might vary slightly based on your operating system and Hugging Face library version). Subsequent runs will use the cached model, making startup much faster.
-   **Functionality:** The soft classifier attempts to assign one of the predefined Tech Paths to the free-text answer based on semantic similarity.

## Troubleshooting

-   **Connection issues between frontend and backend:**
    -   Ensure the backend Flask server is running.
    -   Verify the `API_BASE_URL` in `frontend/src/api.js` correctly points to the backend server (default is `http://localhost:5000/api` for development).
    -   Check for CORS errors in the browser console. If you are running frontend on a different port than backend (e.g. Vite default 5173 and Flask 5000), ensure backend CORS is configured to allow frontend's origin. (This is handled in `backend/poller.py`).
-   **Classification not working as expected:**
    -   For hard classification, check the rules in `/backend/ai_model/hard_classifier.py`.
    -   For soft classification, ensure the `transformers` and `torch` libraries are correctly installed. The first run might be slow due to model download.
-   **Python module import errors (e.g., `ModuleNotFoundError`):**
    -   Ensure you have activated your Python virtual environment if you are using one.
    -   Make sure you are in the correct directory (`backend`) when running `python poller.py`.
    -   Verify all dependencies in `backend/requirements.txt` are installed.
