import unittest
from unittest.mock import patch, MagicMock
import sys
import os
import logging

# Add the parent directory of 'backend' to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

try:
    from backend.ai_model.soft_classifier import soft_classify, CANDIDATE_LABELS, classifier as actual_classifier
except ImportError as e:
    logging.warning(f"ImportError in test_soft_classifier setup: {e}. Ensure PYTHONPATH is correct or run tests from project root.")
    # Define placeholders if import fails, so tests can at least be discovered
    CANDIDATE_LABELS = []
    def soft_classify(text): return None
    actual_classifier = None
except Exception as e: # Catch any exception during classifier loading to be safe
    logging.error(f"Critical error during initial import/setup in test_soft_classifier: {e}", exc_info=True)
    CANDIDATE_LABELS = []
    def soft_classify(text): return None
    actual_classifier = None


class TestSoftClassifier(unittest.TestCase):

    def test_pipeline_loads_new_model_correctly(self):
        """
        Tests if the new Hugging Face model 'MoritzLaurer/deberta-v3-base-zeroshot-v2.0'
        can be loaded correctly by the pipeline.
        """
        if os.environ.get("SKIP_SLOW_TESTS") == "1":
            self.skipTest("Skipping slow model loading test.")

        pipeline_under_test = None # Initialize to None
        try:
            from transformers import pipeline
            # This is the core of the test: attempting to load the specified model.
            pipeline_under_test = pipeline(
                "zero-shot-classification",
                model="MoritzLaurer/deberta-v3-base-zeroshot-v2.0"
            )
            self.assertIsNotNone(pipeline_under_test, "Pipeline failed to load the new model 'MoritzLaurer/deberta-v3-base-zeroshot-v2.0'.")
            logging.info("Successfully loaded MoritzLaurer/deberta-v3-base-zeroshot-v2.0 model for pipeline loading test.")
        except ImportError:
            self.fail("Transformers library not found. Please ensure it is installed.")
        except Exception as e:
            # If any other exception occurs (e.g., network issue, model not found on hub), the test should fail.
            self.fail(f"Failed to load MoritzLaurer/deberta-v3-base-zeroshot-v2.0 model directly: {e}")

    @unittest.skipIf(actual_classifier is None, "Hugging Face pipeline failed to load, skipping live model tests.")
    def test_soft_classify_with_actual_model(self):
        """
        Tests the soft_classify function with the actual Hugging Face model.
        This test will download the model if it's not cached.
        """
        text = "I want to predict stock prices using Python and machine learning techniques."
        expected_label = "Data Science/AI" # This is the most likely candidate

        # It's possible that small models like distilbart-mnli might not always be perfectly accurate
        # or might have closely competing labels. For robustness, we can check if the result
        # is one of a few top candidates if necessary, but for this specific phrase,
        # "Data Science/AI" is strongly indicated.

        logging.info(f"Testing soft_classify with text: '{text}' (actual model from soft_classifier.py)")
        result = soft_classify(text)
        logging.info(f"Soft classification result from soft_classifier.py: '{result}'")

        self.assertIn(result, CANDIDATE_LABELS, f"Result '{result}' not in CANDIDATE_LABELS.")
        self.assertEqual(result, expected_label, f"Expected '{expected_label}', but got '{result}' for text: '{text}'")

    @unittest.skipIf(actual_classifier is None, "Hugging Face pipeline failed to load, skipping live model tests.")
    def test_soft_classify_another_example(self):
        text = "I love building user interfaces and thinking about user experience for web applications."
        # Possible expected labels, UX/UI is strongest, Web Development is also plausible.
        # The new model might be more decisive or pick a different primary.
        # For now, we keep the options broad. If this test becomes flaky,
        # we might need to adjust based on observed behavior of 'MoritzLaurer/deberta-v3-base-zeroshot-v2.0'.
        expected_labels_options = ["UX/UI Design", "Web Development"]

        logging.info(f"Testing soft_classify with text: '{text}' (actual model from soft_classifier.py)")
        result = soft_classify(text)
        logging.info(f"Soft classification result from soft_classifier.py: '{result}'")

        self.assertIn(result, CANDIDATE_LABELS, f"Result '{result}' not in CANDIDATE_LABELS.")
        self.assertIn(result, expected_labels_options, f"Expected one of {expected_labels_options}, but got '{result}' for text: '{text}'")

    @unittest.skipIf(actual_classifier is None, "Hugging Face pipeline failed to load, skipping live model tests.")
    def test_soft_classify_unrelated_text(self):
        text = "This sentence is about enjoying a sunny day at the park."
        # For unrelated text, the model will still pick the "best" fit from the labels.
        # The goal here is not to get a specific label, but to ensure it returns *one* of the labels.
        logging.info(f"Testing soft_classify with unrelated text: '{text}' (actual model from soft_classifier.py)")
        result = soft_classify(text)
        logging.info(f"Soft classification result for unrelated text from soft_classifier.py: '{result}'")
        self.assertIn(result, CANDIDATE_LABELS, f"Result '{result}' for unrelated text not in CANDIDATE_LABELS.")

    def test_soft_classify_empty_text(self):
        # This should return the "Undefined Category" or similar default, without calling the model.
        expected_label = "Undefined Category"
        result = soft_classify("")
        self.assertEqual(result, expected_label)
        result_spaces = soft_classify("   ")
        self.assertEqual(result_spaces, expected_label)

    @patch('backend.ai_model.soft_classifier.classifier') # Mock the pipeline object
    def test_soft_classify_with_mocked_pipeline(self, mock_pipeline_instance):
        """
        Tests the soft_classify function by mocking the Hugging Face pipeline.
        This avoids downloading the model and makes the test faster and more predictable.
        """
        text = "I want to predict stock prices using Python."
        expected_label = "Data Science/AI"

        # Configure the mock pipeline instance to return a predictable result
        mock_pipeline_instance.return_value = {
            'sequence': text,
            'labels': [expected_label, 'Web Development', 'Mobile Apps'], # Mocked label order
            'scores': [0.9, 0.05, 0.05] # Mocked scores
        }

        logging.info(f"Testing soft_classify with text: '{text}' (mocked pipeline)")
        result = soft_classify(text)
        logging.info(f"Soft classification result (mocked pipeline): '{result}'")

        # Check that our mock was called
        mock_pipeline_instance.assert_called_once_with(text, CANDIDATE_LABELS)
        self.assertEqual(result, expected_label)

    @patch('backend.ai_model.soft_classifier.classifier', None) # Simulate classifier failing to load
    def test_soft_classify_when_pipeline_fails_to_load(self):
        text = "Some input text."
        expected_response = "Classification Unavailable" # Or whatever your error handling returns

        # Need to reload the module or somehow make soft_classify see the mocked 'classifier = None'
        # This is tricky because 'classifier' is a global in soft_classifier.py
        # A more robust way would be for soft_classify to take classifier as an optional arg,
        # or use a class structure. For this test, we assume the global 'classifier' is None.
        # The current soft_classifier.py already handles if classifier is None.

        # Temporarily mock the 'classifier' global within the soft_classifier module for this test
        with patch('backend.ai_model.soft_classifier.classifier', None):
            result = soft_classify(text)
            self.assertEqual(result, expected_response)

if __name__ == '__main__':
    # Reduce transformers logging spam during tests if not already handled in soft_classifier.py
    logging.getLogger("transformers").setLevel(logging.ERROR)
    logging.getLogger("huggingface_hub").setLevel(logging.ERROR)
    unittest.main()
