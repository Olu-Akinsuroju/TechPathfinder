import os
import logging
import os
import logging
import time
import threading # For running Flask in a separate thread
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# Try importing classifiers from ai_model package first, then from backend.ai_model
try:
    from ai_model.hard_classifier import hard_classify
    from ai_model.soft_classifier import soft_classify
except ImportError:
    # Fallback for cases where poller.py might be run directly and Python path issues occur
    logging.warning("Could not import classifiers from ai_model, trying backend.ai_model")
    from backend.ai_model.hard_classifier import hard_classify
    from backend.ai_model.soft_classifier import soft_classify

# Load environment variables from .env file
load_dotenv()

# --- Flask App Setup ---
app = Flask(__name__)
# Configure CORS - Allow requests from Vite's default dev server port
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

# --- In-memory store for submissions ---
# This list will store all classified submission data.
# Each item is a dict: e.g., {"id": "...", "freeText": "...", "status": "pending/processed", "method": "...", "assignedLabel": "...", "timestamp": ...}
all_submissions_data = []
submissions_lock = threading.Lock() # To handle concurrent access

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Flask API Endpoints ---
@app.route("/api/submissions", methods=["POST"])
def add_submission():
    global all_submissions_data
    data = request.get_json()

    if not data or "freeText" not in data or not isinstance(data["freeText"], str) or not data["freeText"].strip():
        return jsonify({"error": "Invalid submission data. 'freeText' field is required and must be a non-empty string."}), 400

    free_text_answer = data["freeText"]
    submission_id = f"sub_{time.time()}_{len(all_submissions_data)}"

    submission_record = {
        "id": submission_id,
        "freeText": free_text_answer,
        "status": "pending", # Initial status
        "timestamp": time.time()
    }

    with submissions_lock:
        all_submissions_data.append(submission_record)
        logging.info(f"Added new submission: {submission_id} with text: \"{free_text_answer[:50]}...\"")

    # Perform classification (can be time-consuming, consider offloading for real applications)
    classified_method = None
    classified_label = None

    logging.info(f"Classifying text for {submission_id}: \"{free_text_answer}\"")
    hard_classification_result = hard_classify(free_text_answer)
    if hard_classification_result:
        logging.info(f"Found hard match for {submission_id}: '{hard_classification_result}'")
        classified_method = "hard"
        classified_label = hard_classification_result
    else:
        logging.info(f"No hard match for {submission_id}. Attempting soft classification.")
        soft_classification_result = soft_classify(free_text_answer)
        if soft_classification_result and soft_classification_result not in ["Classification Unavailable", "Classification Failed", "Undefined Category", "Classification Error"]:
            logging.info(f"Soft match for {submission_id} assigned '{soft_classification_result}'")
            classified_method = "soft"
            classified_label = soft_classification_result
        else:
            logging.warning(f"Soft classification for {submission_id} (text: \"{free_text_answer[:50]}...\") resulted in: '{soft_classification_result}'. No definitive Tech Path assigned.")
            classified_method = "soft_failed"
            classified_label = "Unknown" # Or use soft_classification_result if more detail is needed

    # Update the record in all_submissions_data with classification results
    updated_successfully = False
    with submissions_lock:
        for record in all_submissions_data:
            if record["id"] == submission_id:
                record["status"] = "processed"
                record["method"] = classified_method
                record["assignedLabel"] = classified_label
                record["classificationTimestamp"] = time.time() # Add timestamp for classification
                updated_successfully = True
                logging.info(f"Successfully updated submission {submission_id} with classification results.")
                break

    if not updated_successfully:
        # This should ideally not happen if the submission was just added.
        logging.error(f"Failed to find and update submission {submission_id} after classification. This is unexpected.")
        # Decide on how to handle this - maybe return a 500 error. For now, log and proceed.

    return jsonify({"status": "ok", "submissionId": submission_id, "label": classified_label, "method": classified_method}), 201 # 201 Created

@app.route("/api/submissions/latest", methods=["GET"])
def get_latest_submission_route():
    with submissions_lock:
        if not all_submissions_data:
            submission_to_return = None
        else:
            # Return a copy of the last submission
            submission_to_return = all_submissions_data[-1].copy()

    if not submission_to_return:
        return jsonify({"found": False, "message": "No submissions available yet."}), 404

    response_data = submission_to_return # Already a copy
    response_data["found"] = True
    return jsonify(response_data), 200

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "timestamp": time.time()}), 200

# --- Main Execution ---
if __name__ == "__main__":
    logging.info("Starting Flask API server...")

    # Check for environment variables for classifiers if they have specific needs
    # (e.g., API keys for soft_classifier if it were calling an external service)
    # For now, assuming classifiers are self-contained or use .env for their own config.

    logging.info("Flask app starting on port 5000...")
    # Flask's default port is 5000.
    # debug=False is suitable for a production/staging environment.
    # threaded=True can be useful if background tasks within Flask requests are needed,
    # but our classification currently blocks within the request.
    app.run(host='0.0.0.0', port=5000, debug=False)
