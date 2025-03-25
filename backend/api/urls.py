from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

# Crear router para API
router = DefaultRouter()

# Registrar viewsets en el router
router.register(r'posts', views.PostViewSet)
router.register(r'categories', views.CategoryViewSet)
router.register(r'users', views.UserViewSet)

urlpatterns = [
    # Rutas de autenticación JWT
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Rutas de usuarios
    path('auth/register/', views.UserRegistrationView.as_view(), name='register'),
    path('auth/me/', views.UserMeView.as_view(), name='me'),
    
    # Búsqueda de usuarios (para mensajería)
    path('users/search/', views.search_users, name='search_users'),
    
    # Incluir todas las rutas del router
    path('', include(router.urls)),
]
