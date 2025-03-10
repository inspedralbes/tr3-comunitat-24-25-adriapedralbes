from django.urls import path
from . import views

urlpatterns = [
    path('', views.api_root, name='api-root'),
    path('test/email/', views.test_email, name='test-email'),
    path('newsletter/subscribe/', views.subscribe, name='subscribe'),
    path('newsletter/confirm/<uuid:token>/', views.confirm_subscription, name='confirm'),
    path('newsletter/unsubscribe/<uuid:token>/', views.unsubscribe, name='unsubscribe'),
]
