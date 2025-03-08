from django.urls import path
from . import views

urlpatterns = [
    path('newsletter/subscribe/', views.subscribe, name='subscribe'),
    path('newsletter/confirm/<uuid:token>/', views.confirm_subscription, name='confirm'),
    path('newsletter/unsubscribe/<uuid:token>/', views.unsubscribe, name='unsubscribe'),
]
