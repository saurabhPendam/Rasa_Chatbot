from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('chatbot/', views.home, name='chatbot'),
    path('generate-report/', views.generate_report, name='generate_report'),
    path('display-report/', views.display_report, name='display_report'),  # Add this URL
    path('logout/', views.logout_user, name='logout'),
    path('register/', views.register_user, name='register'),
]
