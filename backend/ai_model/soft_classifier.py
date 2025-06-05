import os
import logging
from typing import List, Dict, Any

# Configure logging for the transformers library to be less verbose if desired,
# or handle potential warnings during model download.
# logging.getLogger("transformers").setLevel(logging.ERROR)

# Initialize the pipeline outside the function so it's loaded once per process.
# The model will be downloaded from Hugging Face Hub automatically on first use
# and cached locally (typically in ~/.cache/huggingface/hub/).
try:
    from transformers import pipeline
    # Using a specific model revision can help ensure consistency if needed
    # model_name = "facebook/distilbart-mnli"
    # model_revision = "c2d319c" # Example revision, check Hugging Face for latest stable
    classifier = pipeline(
        "zero-shot-classification",
        model="facebook/distilbart-mnli" # Using main branch by default
    )
    logging.info("Hugging Face zero-shot classification pipeline loaded successfully with model facebook/distilbart-mnli.")
except ImportError:
    logging.error("Transformers library not found. Please install it via pip install transformers torch.")
    classifier = None # Or raise an exception
except Exception as e:
    logging.error(f"Failed to load Hugging Face pipeline: {e}", exc_info=True)
    classifier = None # Or raise an exception

CANDIDATE_LABELS: List[str] = [
    "Web Development",
    "Mobile Apps", # Changed from "Mobile Development" to match user's list
    "Game Development",
    "Data Science/AI",
    "DevOps/Cloud",
    "Cybersecurity",
    "UX/UI Design",
    "Embedded Systems/IoT",
    "Blockchain",
    "AR/VR",
]

def soft_classify(text: str) -> str:
    """
    Classifies the input text into one of the CANDIDATE_LABELS
    using a local zero-shot classification model.

    Args:
        text: The input string to classify.

    Returns:
        The top-scoring Tech Path label from CANDIDATE_LABELS.
        Returns an empty string or a default/error label if classification fails.
    """
    if not classifier:
        logging.error("Soft classifier pipeline is not available.")
        return "Classification Unavailable" # Or raise an error

    if not text or not isinstance(text, str) or not text.strip():
        logging.warning("Soft_classify received empty or invalid text. Returning a default label.")
        return "Undefined Category" # Or handle as appropriate

    try:
        # Perform classification
        # The result is a dictionary containing 'sequence', 'labels', and 'scores'
        # Example: {'sequence': '...', 'labels': ['Data Science/AI', ...], 'scores': [0.95, ...]}
        result: Dict[str, Any] = classifier(text, CANDIDATE_LABELS)

        if result and result.get("labels") and result.get("scores"):
            top_label: str = result["labels"][0]
            top_score: float = result["scores"][0]
            logging.info(f"Soft classification for \"{text}\": Top label '{top_label}' with score {top_score:.4f}")
            return top_label
        else:
            logging.error(f"Soft classification for \"{text}\" returned an unexpected result: {result}")
            return "Classification Failed"

    except Exception as e:
        logging.error(f"Error during soft classification for text \"{text}\": {e}", exc_info=True)
        return "Classification Error"

if __name__ == '__main__':
    # Example Usage
    test_phrases = [
        "I want to predict stock prices using Python.",
        "I enjoy building responsive websites with React and CSS.",
        "My goal is to create amazing games with Unity.",
        "I'm interested in securing networks and preventing cyber attacks.",
        "Let's design a user-friendly interface for our new mobile application.",
        "Exploring the world of augmented reality and virtual experiences.",
        "Working with microcontrollers and IoT devices like Raspberry Pi.",
        "How can I use cloud services like AWS for my server infrastructure?",
        "Developing smart contracts on the Ethereum blockchain.",
        "Building apps for iOS and Android platforms.",
        "What are the latest trends in machine learning?",
        "This is a completely unrelated sentence about cooking pasta." # Test with unrelated text
    ]

    print("Running example soft classifications:")
    for phrase in test_phrases:
        if classifier:
            tech_path = soft_classify(phrase)
            print(f"Text: \"{phrase}\" -> Classified as: \"{tech_path}\"")
        else:
            print(f"Classifier not available. Cannot classify \"{phrase}\"")

    # Test with an empty string
    if classifier:
        empty_text_result = soft_classify("")
        print(f"Text: \"\" -> Classified as: \"{empty_text_result}\"")
