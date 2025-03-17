from rest_framework import status, viewsets, permissions, generics, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from functools import wraps

from .models import Subscriber, User, Category, Post, Comment, PostLike, CommentLike
from .serializers import (
    SubscriberSerializer, UserSerializer, UserRegistrationSerializer, CategorySerializer,
    PostSerializer, PostDetailSerializer, CommentSerializer, PostLikeSerializer, CommentLikeSerializer, UserShortSerializer
)
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.urls import reverse
from .welcome_email import send_welcome_email
from .beehiiv import add_subscriber_to_beehiiv
import uuid
import json
import logging
import traceback

# Decorador para añadir headers CORS a las respuestas
def add_cors_headers(view_func):
    @wraps(view_func)
    def wrapped_view(*args, **kwargs):
        response = view_func(*args, **kwargs)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Headers"] = "*"
        response["Access-Control-Allow-Methods"] = "*"
        return response
    return wrapped_view

# Función para probar la conexión de correo
def test_email_connection():
    """Prueba la conexión con el servidor de correo"""
    try:
        from django.core.mail import get_connection
        connection = get_connection()
        connection.open()
        is_connected = connection.connection is not None
        connection.close()
        return {
            'success': is_connected,
            'message': 'Conexión establecida correctamente' if is_connected else 'No se pudo conectar',
            'email_settings': {
                'EMAIL_HOST': settings.EMAIL_HOST,
                'EMAIL_PORT': settings.EMAIL_PORT,
                'EMAIL_USE_TLS': settings.EMAIL_USE_TLS,
                'EMAIL_USE_SSL': settings.EMAIL_USE_SSL,
            }
        }
    except Exception as e:
        return {
            'success': False,
            'message': f'Error: {str(e)}',
            'error_type': type(e).__name__,
            'email_settings': {
                'EMAIL_HOST': settings.EMAIL_HOST,
                'EMAIL_PORT': settings.EMAIL_PORT,
                'EMAIL_USE_TLS': settings.EMAIL_USE_TLS,
                'EMAIL_USE_SSL': settings.EMAIL_USE_SSL,
            }
        }

# Vista para la ruta raíz
@api_view(['GET'])
@permission_classes([AllowAny])
@add_cors_headers
def api_root(request):
    """
    Vista para la página principal de la API
    """
    return Response({
        'status': 'online',
        'message': 'API de FuturPrive - Acceso restringido',
        'version': '1.0',
        'endpoints_publicos': {
            'newsletter_subscribe': '/api/newsletter/subscribe/',
            'newsletter_confirm': '/api/newsletter/confirm/{token}/',
            'newsletter_unsubscribe': '/api/newsletter/unsubscribe/{token}/'
        }
    })

@api_view(['GET'])
@add_cors_headers
def test_email(request):
    """
    Endpoint para probar la conexión de correo
    """
    # Eliminamos la restricción de DEBUG para permitir diagnóstico
    results = test_email_connection()
    return Response(results)

@api_view(['POST'])
def test_beehiiv(request):
    """
    Endpoint de prueba para verificar la integración con Beehiiv.
    """
    email = request.data.get('email', 'test@example.com')
    name = request.data.get('name', 'Usuario de Prueba')
    
    try:
        print("\n[TEST BEEHIIV] Iniciando prueba de integración con Beehiiv")
        success, message = add_subscriber_to_beehiiv(
            email=email,
            name=name,
            source="Test Integration",
            is_confirmed=True
        )
        
        if success:
            print(f"[TEST BEEHIIV] ÉXITO: {message}")
            return Response({
                'success': True,
                'message': message
            })
        else:
            print(f"[TEST BEEHIIV] ERROR: {message}")
            return Response({
                'success': False,
                'message': message
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        error_message = f"Error en prueba de integración con Beehiiv: {str(e)}"
        print(f"[TEST BEEHIIV] EXCEPCIÓN: {error_message}")
        import traceback
        print(traceback.format_exc())
        
        return Response({
            'success': False,
            'message': error_message
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Eliminamos la función subscribe(), confirm_subscription() y unsubscribe()
# Ya que ahora estas funciones están en views_newsletter.py


# ----------------------- API USUARIOS Y COMUNIDAD -----------------------

class StandardResultsSetPagination(PageNumberPagination):
    """
    Paginación estándar para las vistas de API.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserRegistrationView(generics.CreateAPIView):
    """
    Vista para registro de usuarios.
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer


class UserMeView(APIView):
    """
    Vista para obtener o actualizar el perfil del usuario autenticado.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Vista para listar y recuperar usuarios (sólo lectura).
    """
    queryset = User.objects.all().order_by('-points')
    serializer_class = UserSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'first_name', 'last_name']


class LeaderboardView(generics.ListAPIView):
    """
    Vista para obtener el leaderboard de usuarios.
    """
    serializer_class = UserShortSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Obtener los 10 usuarios con más puntos
        return User.objects.all().order_by('-points')[:10]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Añadir la posición a cada usuario
        leaderboard_data = serializer.data
        for i, user in enumerate(leaderboard_data, 1):
            user['position'] = i
        
        return Response(leaderboard_data)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint para Categorías.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint para Posts.
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['content']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        queryset = Post.objects.all()
        category = self.request.query_params.get('category', None)
        if category and category != 'all':
            queryset = queryset.filter(category__slug=category)
        return queryset


class PinnedPostsView(generics.ListAPIView):
    """
    Vista para obtener posts fijados.
    """
    serializer_class = PostSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Post.objects.filter(is_pinned=True).order_by('-created_at')


class CommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint para Comentarios.
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        post_id = self.request.data.get('post_id')
        parent_id = self.request.data.get('parent_id')
        mentioned_user_id = self.request.data.get('mentioned_user_id')
        
        post = get_object_or_404(Post, id=post_id)
        parent = Comment.objects.filter(id=parent_id).first() if parent_id else None
        mentioned_user = User.objects.filter(id=mentioned_user_id).first() if mentioned_user_id else None
        
        serializer.save(
            author=self.request.user,
            post=post,
            parent=parent,
            mentioned_user=mentioned_user
        )


class PostLikeView(APIView):
    """
    Vista para dar/quitar like a un post.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        like, created = PostLike.objects.get_or_create(user=request.user, post=post)
        
        if created:
            # Incrementar contador de likes del post
            post.likes += 1
            post.save(update_fields=['likes'])
            
            # Si el autor no es el mismo usuario que da like, dar puntos al autor
            if post.author != request.user:
                post.author.points += 1
                post.author.save(update_fields=['points'])
            
            return Response({'status': 'liked', 'likes': post.likes})
        else:
            # Si ya existe el like, lo eliminamos
            like.delete()
            
            # Decrementar contador de likes del post
            post.likes = max(0, post.likes - 1)
            post.save(update_fields=['likes'])
            
            # Si el autor no es el mismo usuario, restar puntos
            if post.author != request.user:
                post.author.points = max(0, post.author.points - 1)
                post.author.save(update_fields=['points'])
            
            return Response({'status': 'unliked', 'likes': post.likes})


class CommentLikeView(APIView):
    """
    Vista para dar/quitar like a un comentario.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id)
        like, created = CommentLike.objects.get_or_create(user=request.user, comment=comment)
        
        if created:
            # Incrementar contador de likes del comentario
            comment.likes += 1
            comment.save(update_fields=['likes'])
            
            # Si el autor no es el mismo usuario que da like, dar puntos al autor
            if comment.author != request.user:
                comment.author.points += 1
                comment.author.save(update_fields=['points'])
            
            return Response({'status': 'liked', 'likes': comment.likes})
        else:
            # Si ya existe el like, lo eliminamos
            like.delete()
            
            # Decrementar contador de likes del comentario
            comment.likes = max(0, comment.likes - 1)
            comment.save(update_fields=['likes'])
            
            # Si el autor no es el mismo usuario, restar puntos
            if comment.author != request.user:
                comment.author.points = max(0, comment.author.points - 1)
                comment.author.save(update_fields=['points'])
            
            return Response({'status': 'unliked', 'likes': comment.likes})
