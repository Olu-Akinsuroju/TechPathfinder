import os
import logging
import time
from apscheduler.schedulers.blocking import BlockingScheduler
from dotenv import load_dotenv

# Assuming sheets_client.py is in the same directory or accessible in PYTHONPATH
# If sheets_client.py is in a different path, adjust the import accordingly.
# e.g., from utils import sheets_client
try:
    from utils.sheets_client import fetch_responses
except ImportError:
    # Fallback if running poller.py directly from backend directory
    from sheets_client import fetch_responses


# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Environment variables
SPREADSHEET_ID = os.getenv('SHEETS_SPREADSHEET_ID')
# Default range to fetch all columns from 'Sheet1'. Modify if your sheet name or range is different.
RANGE_NAME = os.getenv('SHEETS_RANGE_NAME', 'Sheet1!A:Z')
POLLING_INTERVAL_SECONDS = int(os.getenv('POLLING_INTERVAL_SECONDS', 60))

# In-memory store for the last fetched row index.
# For production, consider a more persistent store (e.g., a file or a database).
last_row_index_fetched = 0

def poll_google_sheet():
    """Polls the Google Sheet for new rows and logs them."""
    global last_row_index_fetched

    if not SPREADSHEET_ID:
        logging.error("SHEETS_SPREADSHEET_ID environment variable is not set.")
        return

    if not os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON'):
        logging.error("GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set.")
        return

    logging.info(f"Polling Google Sheet ID: {SPREADSHEET_ID}, Range: {RANGE_NAME}")

    try:
        rows = fetch_responses(SPREADSHEET_ID, RANGE_NAME)
        if not rows:
            logging.info("No data found in the sheet.")
            return

        current_row_count = len(rows)
        logging.info(f"Fetched {current_row_count} rows. Last fetched index was {last_row_index_fetched}.")

        if current_row_count > last_row_index_fetched:
            new_rows_count = 0
            for i in range(last_row_index_fetched, current_row_count):
                # Timestamp is not directly available from sheet rows unless it's a column.
                # Adding a log timestamp.
                logging.info(f"New row data: {rows[i]}")
                new_rows_count += 1

            last_row_index_fetched = current_row_count
            logging.info(f"Processed and logged {new_rows_count} new row(s). Last fetched index updated to {last_row_index_fetched}.")
        else:
            logging.info("No new rows found since last poll.")

    except FileNotFoundError as fnf_error:
        logging.error(f"Service account JSON file not found. Ensure GOOGLE_SERVICE_ACCOUNT_JSON is set correctly. Error: {fnf_error}")
    except Exception as e:
        logging.error(f"An error occurred while polling Google Sheet: {e}", exc_info=True)

if __name__ == "__main__":
    # Log initial state
    logging.info("Starting Google Sheet poller...")
    logging.info(f"Polling interval: {POLLING_INTERVAL_SECONDS} seconds")

    # Perform an initial poll immediately
    poll_google_sheet()

    # Schedule the polling job
    scheduler = BlockingScheduler()
    scheduler.add_job(poll_google_sheet, 'interval', seconds=POLLING_INTERVAL_SECONDS)

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logging.info("Poller stopped.")
