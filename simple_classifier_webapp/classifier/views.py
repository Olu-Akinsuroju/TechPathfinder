from django.shortcuts import render
from .classifier_logic import hard_classify

# Create your views here.
def classify_text_view(request):
    if request.method == 'POST':
        text_input = request.POST.get('text_input', '')
        classification_result = hard_classify(text_input)
        context = {
            'text_input': text_input,
            'classification_result': classification_result
        }
        return render(request, 'classifier/classify_form.html', context)
    else: # GET request
        context = {
            'text_input': '',
            'classification_result': None
        }
        return render(request, 'classifier/classify_form.html', context)
