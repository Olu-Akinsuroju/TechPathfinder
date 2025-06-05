import unittest
import sys
import os

# Add the parent directory of 'backend' to the Python path
# This allows importing from 'backend.ai_model.hard_classifier'
# Adjust if your project structure is different or if you have a better way to manage paths
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

try:
    from backend.ai_model.hard_classifier import hard_classify, HARD_RULES
except ImportError:
    # Fallback for different execution context or if path setup is tricky
    # This assumes that if the above fails, we might be running tests from a context
    # where 'backend' is directly in the path.
    # If your tests are always run from a specific directory (e.g., project root)
    # with `python -m unittest discover`, this might not be necessary.
    print("Failed to import from backend.ai_model.hard_classifier directly, attempting alternative import.")
    print(f"Current sys.path: {sys.path}")
    # This is a bit of a guess; proper path management is key.
    # If 'backend' is the top-level package, and tests are run from root:
    from ai_model.hard_classifier import hard_classify, HARD_RULES


class TestHardClassifier(unittest.TestCase):

    def test_specific_keywords_from_issue(self):
        # "I build games using Unity and custom shaders" → "AR/VR" (Unity maps to AR/VR)
        # The rule "unity": "AR/VR" should catch this.
        self.assertEqual(hard_classify("I build games using Unity and custom shaders"), "AR/VR")

        # "Interested in raspberry Pi projects" → "Embedded Systems/IoT"
        self.assertEqual(hard_classify("Interested in raspberry Pi projects"), "Embedded Systems/IoT")

        # A sentence with no matching keyword → None.
        self.assertIsNone(hard_classify("A sentence with no matching keyword here at all."))

    def test_case_insensitivity(self):
        self.assertEqual(hard_classify("I love GAME ENGINES"), "Game Development")
        self.assertEqual(hard_classify("interested in CLOUD COMPUTING"), "DevOps/Cloud")
        self.assertEqual(hard_classify("Learning PYTHON ML"), "Data Science/AI")
        self.assertEqual(hard_classify("using REACT for web apps"), "Web Development")
        self.assertEqual(hard_classify("talked about AWS services"), "DevOps/Cloud")

    def test_various_keywords(self):
        test_cases = {
            "I want to learn about smart contracts.": "Blockchain",
            "She's designing interfaces for a new app.": "UX/UI Design", # Matches "designing interfaces"
            "He is into cybersecurity and ethical hacking.": "Cybersecurity", # Matches "cybersecurity"
            "We are building websites with Node.js and React.": "Web Development", # Matches "react"
            "My focus is on analyzing datasets.": "Data Science/AI", # Matches "analyzing datasets"
            "They are training AI models.": "Data Science/AI", # Matches "training ai models"
            "I'm developing mobile apps for Android.": "Mobile Development", # Matches "developing mobile apps" or "android"
            "Let's try creating games with Unreal Engine.": "Game Development", # Matches "creating games"
            "He enjoys writing algorithms in Python.": "General Programming", # Matches "writing algorithms" or "python"
            "She is managing servers using Kubernetes.": "DevOps/Cloud" # Matches "managing servers" or "kubernetes"
        }
        for text, expected_path in test_cases.items():
            with self.subTest(text=text):
                self.assertEqual(hard_classify(text), expected_path)

    def test_no_match(self):
        self.assertIsNone(hard_classify("This is a generic sentence without any tech keywords."))
        self.assertIsNone(hard_classify("Just a regular conversation about the weather."))
        self.assertIsNone(hard_classify("")) # Empty string
        self.assertIsNone(hard_classify("   ")) # String with only spaces

    def test_substring_matching(self):
        # Ensure that partial words don't accidentally match if not intended
        # For example, if "ai" is a keyword, "train" should not match.
        # The current HARD_RULES has "python ml", "training ai models", etc.
        # "training ai models" should match "Data Science/AI"
        self.assertEqual(hard_classify("We are training AI models."), "Data Science/AI")
        # "raspberry pi" should match "Embedded Systems/IoT"
        self.assertEqual(hard_classify("A project with raspberry pi."), "Embedded Systems/IoT")
        # "aws" should match "DevOps/Cloud"
        self.assertEqual(hard_classify("Learning about aws services."), "DevOps/Cloud")

    def test_priority_or_specificity(self):
        # If multiple keywords could match, the current implementation returns the first one found.
        # Example: "I use Python for machine learning and web development."
        # HARD_RULES has "python ml": "Data Science/AI" and "machine learning": "Data Science/AI"
        # and "web development": "Web Development" and "python": "General Programming"
        # The behavior depends on the order in HARD_RULES and which substring is found first.

        # "python ml" is more specific than "python"
        self.assertEqual(hard_classify("I use python ml for my project."), "Data Science/AI")
        # "machine learning" vs "python"
        self.assertEqual(hard_classify("My project is about machine learning with python."), "Data Science/AI") # "machine learning" is likely before "python" or "python ml"

        # "cloud computing with aws"
        # "cloud computing": "DevOps/Cloud"
        # "aws": "DevOps/Cloud"
        # Result should be "DevOps/Cloud", order doesn't matter if they map to the same path.
        self.assertEqual(hard_classify("Learning cloud computing with aws."), "DevOps/Cloud")

        # "game development with unity"
        # "game development": "Game Development"
        # "unity": "AR/VR"
        # This will depend on which keyword appears first in HARD_RULES or in the text if keywords are distinct.
        # Current HARD_RULES: "unity" maps to "AR/VR". "game development" maps to "Game Development".
        # With keyword length sorting, "game development" (longer) is checked before "unity" (shorter).
        # Thus, "game development" should be the result.
        self.assertEqual(hard_classify("I am into game development using Unity."), "Game Development")
        # Test based on "game development"
        self.assertEqual(hard_classify("I am into game development using C++."), "Game Development")


if __name__ == '__main__':
    unittest.main()
