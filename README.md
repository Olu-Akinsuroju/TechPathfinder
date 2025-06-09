# Project Title (Replace with your actual project title)

This project includes a polling mechanism to fetch new rows from a Google Sheet linked to a Google Form.

## Features

-   Fetches new rows from a specified Google Sheet every minute (configurable).
-   Uses a Google Cloud Service Account for authentication.
-   Logs new form responses.

## Setup Instructions

### 1. Prerequisites

-   Python 3.x
-   Access to a Google Sheet (usually created from a Google Form).
-   A Google Cloud Platform (GCP) project.

### 2. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-repository-directory>
```

### 3. Install Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```
(Note: `requirements.txt` includes `google-api-python-client`, `oauth2client`, `python-dotenv`, `APScheduler`, `transformers`, and `torch`.)

The `transformers` and `torch` libraries are included for the AI-based "soft" classification feature, which uses a local model to categorize responses when explicit keywords are not found.

### 4. Configure Environment Variables

Create a `.env` file in the root directory of the project. You can copy the example:

```bash
cp .env.example .env
```
If `.env.example` is not provided, create `.env` manually and add the following:

```env
# Google Sheets Configuration
SHEETS_SPREADSHEET_ID=<your_google_sheet_id>
GOOGLE_SERVICE_ACCOUNT_JSON=/path/to/your/service_account_key.json

# Polling Configuration (optional, defaults to 60 seconds)
# POLLING_INTERVAL_SECONDS=60

# Google Sheets Range (optional, defaults to 'Sheet1!A:Z')
# Example: 'My Form Responses!A:F'
# SHEETS_RANGE_NAME='Sheet1!A:Z'

# Column index for the free-text answer in Google Sheets (0-based).
# For example, if the free-text answer is in Column C, use 2.
# Default is 2 if not specified by FREE_TEXT_COLUMN_INDEX in poller.py.
# FREE_TEXT_COLUMN_INDEX=2
```

**Explanation of Environment Variables:**

-   `SHEETS_SPREADSHEET_ID`: The ID of your Google Sheet.
    -   **How to obtain the Google Sheet ID:**
        1.  Open your Google Form.
        2.  Click on the "Responses" tab.
        3.  Click the "Link to Sheets" button (or the green Sheets icon).
        4.  If you're creating a new spreadsheet, it will open. If you've linked one previously, it will open the existing sheet.
        5.  The URL of the Google Sheet will look like this: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=SHEET_GID`.
        6.  Copy the `SPREADSHEET_ID` part from the URL.
-   `GOOGLE_SERVICE_ACCOUNT_JSON`: The absolute path to your Google Cloud Service Account JSON key file.
    -   **How to create and get the Service Account JSON:**
        1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
        2.  Select your GCP project.
        3.  Navigate to "IAM & Admin" > "Service Accounts".
        4.  Click "+ CREATE SERVICE ACCOUNT".
        5.  Fill in the service account details (name, ID, description).
        6.  Click "CREATE AND CONTINUE".
        7.  **Grant access:** For reading Google Sheets, grant the "Viewer" role (or a more restrictive custom role if preferred, though "Viewer" is simplest for read-only access to Sheets data). *Initially, you might need to grant "Editor" role on the specific Google Sheet itself to the service account's email address.*
        8.  Click "CONTINUE".
        9.  Skip granting users access to this service account (unless needed for other purposes).
        10. Click "DONE".
        11. Find the service account you created in the list. Click the three dots (Actions) next to it and select "Manage keys".
        12. Click "ADD KEY" > "Create new key".
        13. Choose "JSON" as the key type and click "CREATE".
        14. The JSON key file will be downloaded to your computer.
    -   **Placement of the JSON key:**
        -   Store this JSON file in a secure location on your machine or server where the poller will run.
        -   **Do not commit this file to your Git repository.** The `.gitignore` file should already include `.env`, and you should ensure your JSON key is also not committed.
        -   Update the `GOOGLE_SERVICE_ACCOUNT_JSON` path in your `.env` file to point to the location where you saved this key.
    -   **Share the Google Sheet with the Service Account:**
        1.  Open the Google Sheet you want to access.
        2.  Click the "Share" button (top right).
        3.  In the "Add people and groups" field, paste the email address of the service account you created (e.g., `your-service-account-name@your-gcp-project-id.iam.gserviceaccount.com`).
        4.  Grant it at least "Viewer" permissions. If "Viewer" doesn't work, try "Commenter" or "Editor" for the sheet. "Viewer" on the Sheet and "Viewer" in IAM should be sufficient for reading.
        5.  Click "Send" or "Share".
-   `POLLING_INTERVAL_SECONDS` (Optional): How often the poller checks for new rows, in seconds. Defaults to 60.
-   `SHEETS_RANGE_NAME` (Optional): The specific sheet and range to query (e.g., `'Sheet1!A:Z'` or `'Form Responses 1!A:G'`). Defaults to `'Sheet1!A:Z'`. Make sure this matches your Google Sheet's structure.
-   `FREE_TEXT_COLUMN_INDEX` (Optional): The 0-based index of the column in your Google Sheet that contains the free-text answer you want to classify. Defaults to `2` (Column C) in `poller.py` if not set. For example, if your free-text is in Column D, set this to `3`.

**Important:** Ensure the `.env` file is included in your `.gitignore` to prevent committing sensitive information.

### 5. Running the Poller

Once the dependencies are installed and the `.env` file is configured with your Sheet ID and Service Account JSON path:

```bash
python backend/poller.py
```

The poller will start, and you should see log messages in your console indicating when it polls the sheet and if new rows are found.

## Modifying Hard Classification Rules

The rule-based ("hard") classifier maps specific keywords or phrases found in the form's free-text answers to predefined Tech Paths. These rules are defined in the `HARD_RULES` dictionary within the `/backend/ai_model/hard_classifier.py` file.

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
    *   Run the tests: `python -m unittest backend.tests.test_hard_classifier` (or discover tests from the root directory).
    *   You can also run the poller and add test entries to your Google Form/Sheet to see the classification in action via the logs.

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

If a free-text answer from the Google Form does not match any of the predefined keywords in the "hard" classifier, the system attempts a "soft" classification using a local AI model.

-   **Technology:** This feature utilizes the Hugging Face `transformers` library and a pre-trained model (`MoritzLaurer/deberta-v3-base-zeroshot-v2.0`) for zero-shot text classification.
-   **Local Model:** The model runs entirely locally. **No external API tokens (e.g., Hugging Face API Token) are required.**
-   **Automatic Download & Caching:**
    -   When the application runs for the first time and the soft classifier is needed, the `transformers` library will automatically download the `MoritzLaurer/deberta-v3-base-zeroshot-v2.0` model (this model might vary in size). This might take a few minutes depending on your internet connection.
    -   The downloaded model is then cached locally on your machine, typically in `~/.cache/huggingface/hub/` (the exact path might vary slightly based on your operating system and Hugging Face library version). Subsequent runs will use the cached model, making startup much faster.
-   **Functionality:** The soft classifier attempts to assign one of the ten predefined Tech Paths to the free-text answer based on semantic similarity.

## Troubleshooting

-   **`FileNotFoundError: [Errno 2] No such file or directory: '/path/to/your/service_account_key.json'`**:
    -   Verify that the path specified in `GOOGLE_SERVICE_ACCOUNT_JSON` in your `.env` file is correct and that the JSON key file exists at that location.
    -   Ensure the path is absolute or correctly relative to where the script is run (absolute paths are recommended for clarity).
-   **`google.auth.exceptions.RefreshError: ...invalid_grant...` or Permission Errors**:
    -   Ensure the Google Sheets API is enabled in your GCP project.
    -   Double-check that you have shared the Google Sheet with your service account's email address and given it at least "Viewer" permissions on the Sheet itself.
    -   Verify the service account has the necessary IAM roles in GCP (e.g., "Service Account User", and ensure the APIs it needs are enabled). For Sheets API, typically no specific GCP role beyond basic access is needed if the Sheet is shared correctly.
-   **No new rows detected**:
    -   Check if new rows are actually being added to the Google Sheet.
    -   Verify the `RANGE_NAME` in `poller.py` (or `SHEETS_RANGE_NAME` in `.env`) correctly covers the columns and sheet name where data is being added.
    -   Look at the poller logs for any error messages.
-   **ImportError: No module named 'utils.sheets_client'**:
    -   If you are running `python poller.py` from the `backend` directory, the import should be `from sheets_client import fetch_responses`.
    -   If you are running from the root directory (`python backend/poller.py`), the import `from utils.sheets_client import fetch_responses` should work if `backend` is a package (contains `__init__.py`). The current `poller.py` has a try-except block to handle this.

```


## Full Stack Application Setup

### Overview

This project consists of a Python backend (Flask API and Google Sheets Poller) and a React frontend.
- The **backend** polls a Google Sheet for new form responses, classifies the text in these responses using hard-rules and a local AI model, and exposes an API endpoint to get the latest classification.
- The **frontend** provides a user interface to view the latest classified Tech Path.

### Backend Setup

The backend is a Python application that includes a Google Sheets poller and a Flask API server.

1.  **Navigate to the Project Root:**
    All backend commands should typically be run from the project root directory, where the main `requirements.txt` and `.env` files are located.

2.  **Create a Python Virtual Environment (Recommended):**
    It is highly recommended to use a Python virtual environment.
    (Example commands, commented out for tool execution compatibility:
    ```bash
    # python -m venv venv
    # source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
    Please run these commands manually in your local terminal if using a virtual environment.)

3.  **Install Dependencies:**
    Ensure all dependencies listed in `requirements.txt` are installed (into your virtual environment if using one):
    ```bash
    pip install -r requirements.txt
    ```
    This includes Flask, Flask-CORS, APScheduler, google-api-python-client, oauth2client, transformers, torch, python-dotenv.

4.  **Configure Environment Variables:**
    Create or update the `.env` file in the project root directory with the following (refer to earlier README sections for details on obtaining these values):
    ```env
    SHEETS_SPREADSHEET_ID=<your_google_sheet_id>
    GOOGLE_SERVICE_ACCOUNT_JSON=/path/to/your/service_account_key.json
    # POLLING_INTERVAL_SECONDS=60 # Optional, defaults to 60
    # SHEETS_RANGE_NAME='Sheet1!A:Z' # Optional, defaults to 'Sheet1!A:Z'
    # FREE_TEXT_COLUMN_INDEX=2 # Optional, 0-based index for free-text column, defaults to 2 (Column C)
    ```
    **Important:** Ensure the `GOOGLE_SERVICE_ACCOUNT_JSON` path is correct and the Google Sheet is shared with the service account.

5.  **Running the Backend (Poller + API Server):**
    The `poller.py` script now runs both the polling job and the Flask API server.
    ```bash
    python backend/poller.py
    ```
    - The poller will start checking the Google Sheet at regular intervals.
    - The Flask API server will start, typically on `http://localhost:5000`. You should see log output from both services in your console.

6.  **Testing the Backend API Endpoint:**
    Once the backend is running and has processed at least one submission, you can test the API endpoint.
    (The `userEmail` parameter is illustrative and currently ignored by the backend endpoint).
    ```bash
    curl "http://localhost:5000/api/submissions/latest"
    # Example with userEmail: curl "http://localhost:5000/api/submissions/latest?userEmail=test@example.com"
    ```
    Expected successful response (example):
    ```json
    {
      "assignedLabel": "Game Development",
      "found": true,
      "freeText": "I love building Unity games!",
      "id": "row_1_167...",
      "method": "hard",
      "timestamp": 167...
    }
    ```
    Expected "not found" response (if no submissions yet):
    ```json
    {
      "found": false,
      "message": "No submissions available yet."
    }
    ```
    You can also check the health endpoint:
    ```bash
    curl "http://localhost:5000/api/health"
    ```

### Frontend Setup

The frontend is a React application built with Vite.

1.  **Navigate to the Frontend Directory:**
    ```bash
    cd frontend
    ```

2.  **Install Dependencies:**
    If this is the first time or `node_modules` is missing:
    ```bash
    npm install
    ```

3.  **Running the Frontend Development Server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, typically on `http://localhost:5173` (the exact port will be shown in your console). Open this URL in your web browser.

4.  **Frontend Environment Variables:**
    The frontend is configured in `frontend/src/api.js` to connect to `http://localhost:5000/api` during development. No separate `.env` file is strictly required in the `/frontend` directory for this basic setup, but for production builds, you might configure `VITE_API_BASE_URL` in `/frontend/.env`.

### End-to-End Workflow

1.  Start the backend: `python backend/poller.py` (from project root).
2.  Start the frontend: `cd frontend && npm run dev` (from project root, or just `npm run dev` if already in `/frontend`).
3.  Submit a response through your Google Form.
4.  Wait for the poller to pick up the new submission (check backend logs, typically within `POLLING_INTERVAL_SECONDS`).
5.  Open the frontend URL (e.g., `http://localhost:5173`) in your browser and navigate to "View My Path Results" (or go directly to `/result`).
6.  The classified result from your form submission should be displayed.
