import os
import logging
import time
import threading # For running Flask in a separate thread
from flask import Flask, jsonify, request
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler # Changed from BlockingScheduler
from dotenv import load_dotenv

try:
    from utils.sheets_client import fetch_responses
    from ai_model.hard_classifier import hard_classify
    from ai_model.soft_classifier import soft_classify
except ImportError:
    from sheets_client import fetch_responses
    from backend.ai_model.hard_classifier import hard_classify
    from backend.ai_model.soft_classifier import soft_classify

# Load environment variables from .env file
load_dotenv()

# --- Flask App Setup ---
app = Flask(__name__)
# Configure CORS - Allow requests from Vite's default dev server port
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

# --- In-memory store for submissions ---
# This list will store classified submission data.
# Each item could be a dict: e.g., {"id": "...", "freeText": "...", "method": "...", "assignedLabel": "..."}
# For simplicity, we'll store the LATEST submission only. A proper DB would be better.
latest_submission_data = None
latest_submission_lock = threading.Lock() # To handle concurrent access if any

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Environment Variables for Poller ---
SPREADSHEET_ID = os.getenv('SHEETS_SPREADSHEET_ID')
RANGE_NAME = os.getenv('SHEETS_RANGE_NAME', 'Sheet1!A:Z')
POLLING_INTERVAL_SECONDS = int(os.getenv('POLLING_INTERVAL_SECONDS', 60))
FREE_TEXT_COLUMN_INDEX = int(os.getenv('FREE_TEXT_COLUMN_INDEX', 2))

last_row_index_fetched = 0

def poll_google_sheet():
    global last_row_index_fetched
    global latest_submission_data

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
            new_rows_processed_this_cycle = 0
            # Process rows from oldest new to newest new
            for i in range(last_row_index_fetched, current_row_count):
                row_data = rows[i]
                logging.info(f"Processing new row data: {row_data}")
                new_rows_processed_this_cycle += 1

                submission_id = f"row_{i+1}_{time.time()}" # Simple unique ID

                free_text_answer = None
                if len(row_data) > FREE_TEXT_COLUMN_INDEX:
                    free_text_answer = row_data[FREE_TEXT_COLUMN_INDEX]
                else:
                    logging.warning(f"Row {i+1} (data: {row_data}) has fewer than {FREE_TEXT_COLUMN_INDEX + 1} columns. Cannot extract free-text.")
                    continue

                if not free_text_answer or not isinstance(free_text_answer, str) or not free_text_answer.strip():
                    logging.info(f"Row {i+1} (data: {row_data}): Free-text answer is empty. Skipping classification.")
                    continue

                logging.info(f"Classifying text: \"{free_text_answer}\"")

                classified_method = None
                classified_label = None

                hard_classification_result = hard_classify(free_text_answer)
                if hard_classification_result:
                    logging.info(f"Found hard match: '{hard_classification_result}' for text: \"{free_text_answer}\"")
                    classified_method = "hard"
                    classified_label = hard_classification_result
                else:
                    logging.info(f"No hard match for \"{free_text_answer}\". Attempting soft classification.")
                    soft_classification_result = soft_classify(free_text_answer)
                    if soft_classification_result and soft_classification_result not in ["Classification Unavailable", "Classification Failed", "Undefined Category", "Classification Error"]:
                        logging.info(f"Soft match assigned '{soft_classification_result}' for text: \"{free_text_answer}\"")
                        classified_method = "soft"
                        classified_label = soft_classification_result
                    else:
                        logging.warning(f"Soft classification for \"{free_text_answer}\" resulted in: '{soft_classification_result}'. No definitive Tech Path assigned.")
                        # Decide if you want to store this or not
                        classified_method = "soft_failed"
                        classified_label = "Unknown"


                # Update the global latest_submission_data
                # This will effectively store the *very latest* processed row from this batch
                if classified_label and classified_method:
                    with latest_submission_lock:
                        latest_submission_data = {
                            "id": submission_id,
                            "freeText": free_text_answer,
                            "method": classified_method,
                            "assignedLabel": classified_label,
                            "timestamp": time.time() # Add timestamp for freshness
                        }
                        logging.info(f"Updated latest_submission_data with: {latest_submission_data['id']}")

            last_row_index_fetched = current_row_count
            logging.info(f"Processed {new_rows_processed_this_cycle} new row(s). Last fetched index updated to {last_row_index_fetched}.")
        else:
            logging.info("No new rows found since last poll.")

    except FileNotFoundError as fnf_error:
        logging.error(f"Service account JSON file not found. Error: {fnf_error}")
    except Exception as e:
        logging.error(f"An error occurred while polling Google Sheet: {e}", exc_info=True)

# --- Flask API Endpoints ---
@app.route("/api/submissions/latest", methods=["GET"])
def get_latest_submission_route():
    # user_email = request.args.get("userEmail") # User email not used for now
    with latest_submission_lock:
        submission_to_return = latest_submission_data

    if not submission_to_return:
        return jsonify({ "found": False, "message": "No submissions available yet." }), 404

    # Return a copy to avoid potential modification issues if the object is complex
    return jsonify(dict(submission_to_return, found=True)), 200

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "timestamp": time.time()}), 200

# --- Main Execution ---
if __name__ == "__main__":
    logging.info("Starting Google Sheet poller with integrated Flask API...")
    logging.info(f"Polling interval: {POLLING_INTERVAL_SECONDS} seconds")
    logging.info(f"Free-text answer column index: {FREE_TEXT_COLUMN_INDEX} (0-based)")

    # Use BackgroundScheduler for the poller job so Flask can run in the main thread
    scheduler = BackgroundScheduler()
    scheduler.add_job(poll_google_sheet, 'interval', seconds=POLLING_INTERVAL_SECONDS)
    scheduler.start()

    # Perform an initial poll immediately if desired (optional)
    # logging.info("Performing initial poll...")
    # poll_google_sheet()

    logging.info("Starting Flask app on port 5000...")
    # Flask's default port is 5000. Ensure it doesn't conflict.
    # Use threaded=True if needed, though BackgroundScheduler handles the poller separately.
    app.run(host='0.0.0.0', port=5000, debug=False)

    # Cleanly shut down scheduler when app exits
    # This might not be reached if app.run() blocks indefinitely until Ctrl+C
    # Consider using atexit or signal handling for robust shutdown if needed.
    # try:
    #     while True:
    #         time.sleep(2)
    # except (KeyboardInterrupt, SystemExit):
    #     scheduler.shutdown()
