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
    from ai_model.hard_classifier import hard_classify # New import
except ImportError:
    # Fallback if running poller.py directly from backend directory
    from sheets_client import fetch_responses
    from backend.ai_model.hard_classifier import hard_classify # Adjusted for potential execution from root


# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Environment variables
SPREADSHEET_ID = os.getenv('SHEETS_SPREADSHEET_ID')
# Default range to fetch all columns from 'Sheet1'. Modify if your sheet name or range is different.
RANGE_NAME = os.getenv('SHEETS_RANGE_NAME', 'Sheet1!A:Z')
POLLING_INTERVAL_SECONDS = int(os.getenv('POLLING_INTERVAL_SECONDS', 60))
# New: Column index for the free-text answer (0-based)
# Defaulting to 2 (Column C). Adjust if your form's free-text answer is in a different column.
FREE_TEXT_COLUMN_INDEX = int(os.getenv('FREE_TEXT_COLUMN_INDEX', 2))

# In-memory store for the last fetched row index.
# For production, consider a more persistent store (e.g., a file or a database).
last_row_index_fetched = 0

def poll_google_sheet():
    """Polls the Google Sheet for new rows, classifies free-text, and logs them."""
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
                row_data = rows[i]
                logging.info(f"New row data: {row_data}") # Log the whole row first
                new_rows_count += 1

                # Extract free-text answer
                free_text_answer = None
                if len(row_data) > FREE_TEXT_COLUMN_INDEX:
                    free_text_answer = row_data[FREE_TEXT_COLUMN_INDEX]
                else:
                    logging.warning(f"Row {i+1} (data: {row_data}) has fewer than {FREE_TEXT_COLUMN_INDEX + 1} columns. Cannot extract free-text answer.")
                    continue # Skip to next row if column doesn't exist

                if not free_text_answer or not isinstance(free_text_answer, str) or not free_text_answer.strip():
                    logging.info(f"Row {i+1} (data: {row_data}): Free-text answer in column {FREE_TEXT_COLUMN_INDEX + 1} is empty or not valid text. Skipping hard classification.")
                    continue


                # Call hard_classify
                classification_result = hard_classify(free_text_answer)

                if classification_result:
                    logging.info(f"Found hard match: '{classification_result}' for text: \"{free_text_answer}\"")
                else:
                    logging.info(f"No hard match found for text: \"{free_text_answer}\"; will fallback to soft classification later.")

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
    logging.info("Starting Google Sheet poller with hard classification...")
    logging.info(f"Polling interval: {POLLING_INTERVAL_SECONDS} seconds")
    logging.info(f"Free-text answer column index: {FREE_TEXT_COLUMN_INDEX} (0-based, e.g., 2 for Column C)")

    # Perform an initial poll immediately
    poll_google_sheet()

    # Schedule the polling job
    scheduler = BlockingScheduler()
    scheduler.add_job(poll_google_sheet, 'interval', seconds=POLLING_INTERVAL_SECONDS)

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logging.info("Poller stopped.")
