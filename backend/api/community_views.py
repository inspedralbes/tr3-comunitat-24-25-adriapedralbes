from rest_framework.decorators import api_view, permission_classes
from rest_framework import status, permissions, generics
from rest_framework.response import Response
from django.db.models import Count

from .models import Post, User
from .serializers import PostSerializer, UserSerializer

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def pinned_posts(request):
    """
    Devuelve los posts fijados en la comunidad
    """
    posts = Post.objects.filter(is_pinned=True).select_related('author', 'category').order_by('-created_at')
    
    # Añadir contador de comentarios
    posts = posts.annotate(comments_count=Count('comments'))
    
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def leaderboard(request):
    """
    Devuelve el ranking de usuarios basado en puntos
    """
    # Obtener los 10 usuarios con más puntos
    users = User.objects.filter(is_active=True).order_by('-points')[:10]
    
    # Crear lista con datos simplificados para el leaderboard
    leaderboard_data = []
    for i, user in enumerate(users):
        leaderboard_data.append({
            'position': i + 1,
            'id': user.id,
            'username': user.username,
            'avatar_url': user.avatar_url.url if user.avatar_url else None,
            'level': user.level,
            'points': user.points,
        })
    
    return Response(leaderboard_data)
