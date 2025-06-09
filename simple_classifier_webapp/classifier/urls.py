from django.urls import path
from . import views

app_name = 'classifier'  # Optional: define an application namespace

urlpatterns = [
    path('', views.classify_text_view, name='classify_text'),
]
