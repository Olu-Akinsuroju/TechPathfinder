from django.test import TestCase, Client
from django.urls import reverse

class ClassifierViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.classify_url = reverse('classifier:classify_text') # Assuming 'classifier' is the app_name

    def test_classify_page_loads_correctly(self):
        """Test that the classification page loads correctly with a GET request."""
        response = self.client.get(self.classify_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'classifier/classify_form.html')

    def test_classification_with_matching_keyword(self):
        """Test POST request with a keyword that should match."""
        data = {'text_input': 'I love game engines'}
        response = self.client.post(self.classify_url, data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['text_input'], 'I love game engines')
        self.assertEqual(response.context['classification_result'], 'Game Development')
        self.assertContains(response, "Game Development")
        self.assertContains(response, 'Input: "I love game engines"') # Check for original text display

    def test_classification_with_no_matching_keyword(self):
        """Test POST request with text that should not match any keyword."""
        data = {'text_input': 'Just a regular sentence.'}
        response = self.client.post(self.classify_url, data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['text_input'], 'Just a regular sentence.')
        self.assertIsNone(response.context['classification_result'])
        self.assertContains(response, "No match found.")
        self.assertContains(response, 'Input: "Just a regular sentence."')

    def test_classification_with_empty_input(self):
        """Test POST request with empty input text."""
        data = {'text_input': ''}
        response = self.client.post(self.classify_url, data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['text_input'], '')
        self.assertIsNone(response.context['classification_result'])
        # For empty input, the current template doesn't show "No match found" or the input text in the result section.
        # This is an acceptable behavior, so we won't assert for those messages.
