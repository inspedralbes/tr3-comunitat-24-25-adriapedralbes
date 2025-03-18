"""
Utilidades de depuración para diagnosticar problemas con los posts.
"""
import logging
import traceback
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Post, Category
from .serializers import PostSerializer

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_posts(request):
    """
    Endpoint para diagnosticar problemas con los posts.
    """
    try:
        # 1. Contar posts totales
        total_posts = Post.objects.all().count()
        
        # 2. Contar posts del usuario actual
        user_posts = Post.objects.filter(author=request.user).count()
        
        # 3. Obtener el post más reciente
        latest_post = None
        latest_post_data = None
        if Post.objects.exists():
            latest_post = Post.objects.latest('created_at')
            latest_post_data = {
                'id': str(latest_post.id),
                'author': latest_post.author.username,
                'title': latest_post.title,
                'content': latest_post.content,
                'created_at': latest_post.created_at.isoformat(),
                'category': str(latest_post.category.name) if latest_post.category else None
            }
        
        # 4. Listar categorías
        categories = [
            {
                'id': cat.id,
                'name': cat.name,
                'slug': cat.slug
            } for cat in Category.objects.all()
        ]
        
        # 5. Crear un post de prueba
        test_post = Post.objects.create(
            author=request.user,
            title="Post de diagnóstico",
            content="Este post fue creado como parte del diagnóstico de problemas.",
            category=Category.objects.first() if Category.objects.exists() else None
        )
        
        # 6. Verificar si el post de prueba se creó correctamente
        post_created = Post.objects.filter(id=test_post.id).exists()
        
        # 7. Serializar el post de prueba
        serializer = PostSerializer(test_post, context={'request': request})
        serialized_post = serializer.data
        
        # 8. Verificar cuántos posts hay ahora
        new_total_posts = Post.objects.all().count()
        
        return Response({
            'total_posts': total_posts,
            'user_posts': user_posts,
            'latest_post': latest_post_data,
            'categories': categories,
            'test_post_created': post_created,
            'test_post_id': str(test_post.id),
            'serialized_test_post': serialized_post,
            'new_total_posts': new_total_posts,
            'difference': new_total_posts - total_posts
        })
    except Exception as e:
        logger.error(f"Error en diagnóstico de posts: {str(e)}")
        logger.error(traceback.format_exc())
        return Response({
            'error': str(e),
            'traceback': traceback.format_exc()
        }, status=500)
