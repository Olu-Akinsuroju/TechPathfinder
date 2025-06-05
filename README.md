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
(Note: `requirements.txt` includes `google-api-python-client`, `oauth2client`, `python-dotenv`, and `APScheduler`.)

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

**Important:** Ensure the `.env` file is included in your `.gitignore` to prevent committing sensitive information.

### 5. Running the Poller

Once the dependencies are installed and the `.env` file is configured with your Sheet ID and Service Account JSON path:

```bash
python backend/poller.py
```

The poller will start, and you should see log messages in your console indicating when it polls the sheet and if new rows are found.

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
