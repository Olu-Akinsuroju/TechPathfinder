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
    logging.info("Attempting to import classifiers from ai_model package...")
    from ai_model.hard_classifier import hard_classify
    from ai_model.soft_classifier import soft_classify
    logging.info("Successfully imported classifiers from ai_model.")
except ImportError as e:
    logging.warning(f"Could not import from ai_model ({e}), trying backend.ai_model...")
    from backend.ai_model.hard_classifier import hard_classify
    from backend.ai_model.soft_classifier import soft_classify
    logging.info("Successfully imported classifiers from backend.ai_model.")
except Exception as e:
    logging.error(f"An unexpected error occurred during classifier import: {e}", exc_info=True)
    # Depending on severity, might re-raise or exit
    raise

# Load environment variables from .env file
load_dotenv()

# --- Flask App Setup ---
app = Flask(__name__)
# Comment out the old global CORS configuration
# CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "https://Techpathfinder.onrender.com"])

# Configure resource-specific CORS for /api/* routes
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://tech-path-frontend.onrender.com", # Production frontend URL from user issue
            "http://localhost:3000",                   # Common React dev port
            "http://localhost:5173"                    # Vite default dev port
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# --- In-memory store for submissions ---
# This list will store all classified submission data.
# Each item is a dict: e.g., {"id": "...", "freeText": "...", "status": "pending/processed", "method": "...", "assignedLabel": "...", "timestamp": ...}
all_submissions_data = []
submissions_lock = threading.Lock() # To handle concurrent access

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Flask API Endpoints ---
@app.route("/api/submissions", methods=["POST", "OPTIONS"]) # Added "OPTIONS"
def add_submission():
    if request.method == 'OPTIONS':
        # Preflight request. Flask-CORS should handle Access-Control-Allow-* headers.
        # For non-simple requests (e.g. with Content-Type: application/json),
        # the browser sends an OPTIONS request first to check if the actual request is allowed.
        # Returning a simple 200 OK here is sufficient.
        response = jsonify({})
        # Flask-CORS with resource-specific setup should automatically add:
        # Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers
        return response, 200

    # Existing POST logic
    if request.method == 'POST':
        global all_submissions_data
        data = request.get_json()

        if not data or "freeText" not in data or not isinstance(data["freeText"], str) or not data["freeText"].strip():
            return jsonify({"error": "Invalid submission data. 'freeText' field is required and must be a non-empty string."}), 400

        free_text_answer = data["freeText"]
        submission_id = f"sub_{time.time()}_{len(all_submissions_data)}"

    # Initialize submission_record with all fields from the payload,
    # plus backend-generated id, timestamp, and initial status.
    submission_record = {
        "id": submission_id,
        "timestamp": time.time(),
        "status": "pending", # Initial status
        **data  # Unpack all fields from the validated JSON payload
    }
    # Ensure freeText used for classification is the one from the payload,
    # which is already handled as 'data' contains 'freeText'.
    free_text_answer = data["freeText"] # Used for classification, already part of 'data'

    with submissions_lock:
        all_submissions_data.append(submission_record)
        # Log the free text from the record for consistency
        logging.info(f"Added new submission: {submission_id} with text: \"{submission_record.get('freeText', '')[:50]}...\"")

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

    # Fallback for any other method not explicitly handled (though route decorator limits this)
    return jsonify({"error": "Method not allowed"}), 405

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

@app.route('/api/submissions/<submission_id>', methods=['GET'])
def get_submission_by_id(submission_id):
    found_submission_data = None
    with submissions_lock:
        for record in all_submissions_data:
            if record['id'] == submission_id:
                # Create a copy to avoid modifying the original record if further processing is done
                found_submission_data = record.copy()
                break

    if found_submission_data:
        # Map keys as per requirements for the response
        # Map keys as per requirements for the response
        # Now that add_submission stores the full payload, we can map these fields.
        response_dict = {
            "id": found_submission_data.get("id"),
            "whyCS": found_submission_data.get("whyComputerScience"),
            "motivation": found_submission_data.get("motivation"),
            "excitement": found_submission_data.get("excitedActivity"),
            "tools": found_submission_data.get("preferredTools"), # Stored as an array from frontend
            "projectDescription": found_submission_data.get("projectDescription"),
            "assignedLabel": found_submission_data.get("assignedLabel"),
            "hardOrSoft": found_submission_data.get("method"), # Map 'method' to 'hardOrSoft'
            "timestamp": found_submission_data.get("timestamp"),
            "name": found_submission_data.get("name"), # Include other useful fields
            "workEnvironment": found_submission_data.get("workEnvironment"),
            "freeText": found_submission_data.get("freeText"), # This is often same as projectDescription
            "status": found_submission_data.get("status")
        }
        # Filter out keys where the value is None, to keep the response clean if some optional fields were not provided.
        cleaned_response_dict = {k: v for k, v in response_dict.items() if v is not None}

        return jsonify(cleaned_response_dict), 200
    else:
        return jsonify({"error": "Submission not found"}), 404

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "timestamp": time.time()}), 200

# --- Main Execution ---
if __name__ == "__main__":
    logging.info("Backend application starting up in __main__ block...")
    # BasicConfig is set globally above. If modules also call it, it might have no effect or conflict.
    # Ensure basicConfig is called only once, ideally at the very start of the application.
    # Here, it's assumed the global one at the top of the file (after imports) is sufficient.

    logging.info("Starting Flask API server...") # This existing log is good.

    # Check for environment variables for classifiers if they have specific needs
    # (e.g., API keys for soft_classifier if it were calling an external service)
    # For now, assuming classifiers are self-contained or use .env for their own config.

    logging.info("Attempting to start Flask development server (app.run)...")
    # Flask's default port is 5000.
    # debug=False is suitable for a production/staging environment.
    # threaded=True can be useful if background tasks within Flask requests are needed,
    # but our classification currently blocks within the request.
    app.run(host='0.0.0.0', port=5000, debug=False)
