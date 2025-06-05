import os
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Path to the service account key file
# Ensure GOOGLE_SERVICE_ACCOUNT_JSON is set in your .env file
SERVICE_ACCOUNT_FILE = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')

# Scopes required for the Google Sheets API
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

def authenticate_google_sheets():
    """Authenticates with the Google Sheets API using service account credentials."""
    if not SERVICE_ACCOUNT_FILE:
        raise ValueError("GOOGLE_SERVICE_ACCOUNT_JSON environment variable not set.")

    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        raise FileNotFoundError(f"Service account key file not found at {SERVICE_ACCOUNT_FILE}")

    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return creds

def fetch_responses(sheet_id: str, range_name: str):
    """Fetches all rows from the specified Google Sheet and range.

    Args:
        sheet_id: The ID of the Google Sheet.
        range_name: The range of cells to fetch (e.g., 'Sheet1!A:Z').

    Returns:
        A list of lists, where each inner list represents a row of data.
    """
    creds = authenticate_google_sheets()
    service = build('sheets', 'v4', credentials=creds)

    sheet = service.spreadsheets()
    result = sheet.values().get(spreadsheetId=sheet_id, range=range_name).execute()
    values = result.get('values', [])

    return values

if __name__ == '__main__':
    # Example usage (requires environment variables to be set)
    # Ensure you have a .env file with:
    # SHEETS_SPREADSHEET_ID=<your_sheet_id>
    # GOOGLE_SERVICE_ACCOUNT_JSON=/path/to/your/service_account_key.json

    spreadsheet_id = os.getenv('SHEETS_SPREADSHEET_ID')
    # Example range: 'Sheet1!A:D' means all columns A to D from Sheet1
    # Adjust the range according to your sheet structure
    sample_range_name = 'Sheet1!A:Z'

    if not spreadsheet_id:
        print("SHEETS_SPREADSHEET_ID environment variable not set. Please set it in your .env file.")
    else:
        try:
            print(f"Fetching data from spreadsheet: {spreadsheet_id}, range: {sample_range_name}")
            responses = fetch_responses(spreadsheet_id, sample_range_name)
            if not responses:
                print("No data found.")
            else:
                for i, row in enumerate(responses):
                    print(f"Row {i + 1}: {row}")
        except Exception as e:
            print(f"An error occurred: {e}")
