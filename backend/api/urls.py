from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Configurar router para las vistas viewset
router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'categories', views.CategoryViewSet)
router.register(r'posts', views.PostViewSet)
router.register(r'comments', views.CommentViewSet)

urlpatterns = [
    # Rutas de la API de newsletter
    path('newsletter/subscribe/', views.subscribe, name='subscribe'),
    path('newsletter/confirm/<uuid:token>/', views.confirm_subscription, name='confirm'),
    path('newsletter/unsubscribe/<uuid:token>/', views.unsubscribe, name='unsubscribe'),
    path('test/beehiiv/', views.test_beehiiv, name='test_beehiiv'),
    
    # Rutas de la API de usuarios y comunidad
    path('', include(router.urls)),
    path('auth/register/', views.UserRegistrationView.as_view(), name='register'),
    path('auth/me/', views.UserMeView.as_view(), name='me'),
    path('leaderboard/', views.LeaderboardView.as_view(), name='leaderboard'),
    path('pinned-posts/', views.PinnedPostsView.as_view(), name='pinned-posts'),
    path('posts/<uuid:post_id>/like/', views.PostLikeView.as_view(), name='post-like'),
    path('comments/<uuid:comment_id>/like/', views.CommentLikeView.as_view(), name='comment-like'),
]
