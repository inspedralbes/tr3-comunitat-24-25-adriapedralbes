from rest_framework import status, viewsets, permissions, generics, filters
from api.gamification.services import award_points
import logging

# Configurar logger
logger = logging.getLogger(__name__)
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404

from .models import Subscriber, User, Category, Post, Comment, PostLike, CommentLike, Course, Lesson, Event
from .serializers import (
    SubscriberSerializer, UserSerializer, UserRegistrationSerializer, CategorySerializer,
    PostSerializer, PostDetailSerializer, CommentSerializer, PostLikeSerializer, CommentLikeSerializer, UserShortSerializer,
    CourseSerializer, CourseDetailSerializer, LessonSerializer, LessonDetailSerializer, EventSerializer
)
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.urls import reverse
from .welcome_email import send_welcome_email
from .beehiiv import add_subscriber_to_beehiiv
from datetime import timedelta
import datetime
import uuid
import os

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

@api_view(['POST'])
@permission_classes([AllowAny])  # Explícitamente permitir acceso sin autenticación
def subscribe(request):
    """
    API endpoint para suscribirse a la newsletter. No requiere autenticación.
    """
    serializer = SubscriberSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        name = serializer.validated_data.get('name', '')
        
        # Verificar si ya existe el email
        try:
            subscriber = Subscriber.objects.get(email=email)
            
            if subscriber.confirmed:
                return Response({
                    'success': False,
                    'message': 'Este correo ya está suscrito a nuestra newsletter.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Si existe pero no está confirmado, actualizamos el nombre
            if name and name != subscriber.name:
                subscriber.name = name
                subscriber.save(update_fields=['name'])
                
        except Subscriber.DoesNotExist:
            # Crear nuevo suscriptor
            subscriber = Subscriber(
                email=email,
                name=name,
                confirmed=False
            )
            subscriber.save()
        
        # Enviar email de confirmación
        try:
            send_confirmation_email(subscriber)
            
            # También registramos en Beehiiv (con confirmed=false)
            try:
                print("\n[BEEHIIV-PRE] Registrando preliminarmente en Beehiiv (antes de confirmación)")
                success, message = add_subscriber_to_beehiiv(
                    email=subscriber.email,
                    name=subscriber.name,
                    source="FuturPrive-PreConfirmation",
                    is_confirmed=False
                )
                if success:
                    print(f"[BEEHIIV-PRE] ÉXITO en registro preliminar: {message}")
                else:
                    print(f"[BEEHIIV-PRE] ERROR en registro preliminar: {message}")
            except Exception as e:
                print(f"[BEEHIIV-PRE] EXCEPCIÓN en registro preliminar: {str(e)}")
                # No bloqueamos el flujo principal
            
            return Response({
                'success': True,
                'message': 'Te hemos enviado un correo para confirmar tu suscripción.'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Log del error
            import traceback
            print(f"Error enviando email: {e}")
            print(traceback.format_exc())
            
            # Guardamos el suscriptor pero informamos del problema con el correo
            return Response({
                'success': False,
                'message': 'Hubo un problema al enviar el correo de confirmación, pero tus datos se han guardado. El administrador te contactará para confirmar.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'success': False,
        'message': 'Los datos proporcionados no son válidos.',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])  # Explícitamente permitir acceso sin autenticación
def confirm_subscription(request, token):
    """
    API endpoint para confirmar la suscripción.
    """
    try:
        subscriber = Subscriber.objects.get(confirmation_token=token)
        
        if not subscriber.confirmed:
            print(f"\n[CONFIRMACIÓN] Confirmando suscripción para: {subscriber.email}")
            subscriber.confirmed = True
            subscriber.save(update_fields=['confirmed'])
            
            # Enviar email de bienvenida con los recursos prometidos
            try:
                send_welcome_email(subscriber)
                print(f"[CONFIRMACIÓN] Email de bienvenida enviado a: {subscriber.email}")
            except Exception as e:
                print(f"Error enviando email de bienvenida: {str(e)}")
                import traceback
                print(traceback.format_exc())
            
            # Agregar a Beehiiv
            try:
                print("\n[BEEHIIV] Iniciando registro en Beehiiv para suscriptor confirmado")
                success, message = add_subscriber_to_beehiiv(
                    email=subscriber.email,
                    name=subscriber.name,
                    source="FuturPrive Newsletter",
                    is_confirmed=True
                )
                if success:
                    print(f"[BEEHIIV] ÉXITO: Usuario {subscriber.email} registrado en Beehiiv. {message}")
                else:
                    print(f"[BEEHIIV] ERROR: {message}")
                    # Intentar con correo directo
                    print("[BEEHIIV] Intentando suscripción directa como fallback...")
                    # Hacemos una llamada al endpoint de prueba como fallback
                    import requests
                    fallback_url = f"{settings.SITE_URL}/api/test/beehiiv/"
                    fallback_data = {
                        "email": subscriber.email,
                        "name": subscriber.name if subscriber.name else "Suscriptor"
                    }
                    fallback_response = requests.post(fallback_url, json=fallback_data)
                    print(f"[BEEHIIV] Respuesta de fallback: {fallback_response.status_code} - {fallback_response.text}")
            except Exception as e:
                print(f"[BEEHIIV] EXCEPCIÓN al registrar en Beehiiv: {str(e)}")
                import traceback
                print(traceback.format_exc())
                # No hacemos que falle todo el proceso si hay un error con Beehiiv
            
            return Response({
                'success': True,
                'message': '¡Gracias! Tu suscripción ha sido confirmada con éxito.'
            })
        
        return Response({
            'success': True,
            'message': 'Tu suscripción ya ha sido confirmada anteriormente.'
        })
        
    except Subscriber.DoesNotExist:
        return Response({
            'success': False,
            'message': 'El token de confirmación no es válido.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])  # Explícitamente permitir acceso sin autenticación
def unsubscribe(request, token):
    """
    API endpoint para cancelar la suscripción.
    """
    try:
        subscriber = Subscriber.objects.get(confirmation_token=token)
        email = subscriber.email
        subscriber.delete()
        
        return Response({
            'success': True,
            'message': f'El correo {email} ha sido eliminado de nuestra lista.'
        })
        
    except Subscriber.DoesNotExist:
        return Response({
            'success': False,
            'message': 'El token de cancelación no es válido.'
        }, status=status.HTTP_404_NOT_FOUND)


def send_confirmation_email(subscriber):
    """
    Envía un email de confirmación al suscriptor.
    """
    # Ahora usamos la ruta del frontend en lugar de la API
    confirmation_link = f"{settings.SITE_URL}/newsletter/confirm/{subscriber.confirmation_token}"
    unsubscribe_link = f"{settings.SITE_URL}/newsletter/unsubscribe/{subscriber.confirmation_token}/"
    
    subject = '¿ERES UNA IA?'
    
    # Contenido HTML
    context = {
        'name': subscriber.name if subscriber.name else 'Usuario',
        'confirmation_link': confirmation_link,
        'unsubscribe_link': unsubscribe_link
    }
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Confirma tu correo</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 650px;
            }}
            p {{
                font-size: 16px;
                margin-bottom: 24px;
            }}
            .red {{
                color: #ff0000;
            }}
            .bold {{
                font-weight: bold;
            }}
        </style>
    </head>
    <body>
        <p>Debes confirmar tu correo.</p>
        
        <p>Si es que NO te interesa saber cómo la IA puede ahorrarte cientos de horas este año, pues ignora este email y sigue haciendo todo manualmente.</p>
        
        <p>Pero si es que SÍ te interesa dejar que la tecnología trabaje PARA TI mientras duermes...</p>
        
        <p class="bold">DEBES CONFIRMAR HACIENDO CLIC EN EL ENLACE QUE TIENES DEBAJO.</p>
        
        <p>
            <a href="{context['confirmation_link']}" class="red">CONFIRMAR AHORA</a>
        </p>
        
        <p>Pd: Confirma arriba 👆 para acceder a tu regalo.</p>
        
        <p>Pasa un día productivo (o no),<br>
        Adrià Estévez</p>
        
        <p>© FuturPrive - Todos los derechos reservados.</p>
    </body>
    </html>
    """
    
    # Versión texto plano
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject=subject,
        message=plain_message,
        html_message=html_message,
        from_email='Adrià Estévez <adria@futurprive.com>',
        recipient_list=[subscriber.email],
        fail_silently=False,
    )


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
        user = request.user
        serializer = UserSerializer(user, context={'request': request})
        user_data = serializer.data
        
        # Añadir contador de posts, likes recibidos y comentarios
        user_data['posts_count'] = Post.objects.filter(author=user).count()
        
        post_likes = PostLike.objects.filter(post__author=user).count()
        comment_likes = CommentLike.objects.filter(comment__author=user).count()
        user_data['likes_received'] = post_likes + comment_likes
        
        user_data['comments_count'] = Comment.objects.filter(author=user).count()
        
        # Calcular la posición en el ranking (basado en puntos)
        # Contar cuántos usuarios tienen más puntos que el usuario actual
        higher_ranked_users = User.objects.filter(points__gt=user.points).count()
        # La posición es el número de usuarios con más puntos + 1
        user_data['position'] = higher_ranked_users + 1
        
        return Response(user_data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            
            # Obtener datos actualizados del usuario con la posición en el ranking
            user_data = serializer.data
            
            # Calcular la posición en el ranking
            higher_ranked_users = User.objects.filter(points__gt=request.user.points).count()
            user_data['position'] = higher_ranked_users + 1
            
            return Response(user_data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request):
        """Actualizar avatar del usuario"""
        if 'avatar_url' not in request.FILES:
            return Response({"error": "No se ha proporcionado una imagen"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Eliminar avatar anterior si existe
        if request.user.avatar_url and hasattr(request.user.avatar_url, 'path') and os.path.isfile(request.user.avatar_url.path):
            try:
                os.remove(request.user.avatar_url.path)
            except Exception as e:
                print(f"Error al eliminar avatar anterior: {e}")
        
        # Guardar nuevo avatar
        request.user.avatar_url = request.FILES['avatar_url']
        request.user.save()
        
        # Serializar la respuesta con datos completos
        serializer = UserSerializer(request.user, context={'request': request})
        user_data = serializer.data
        
        # Calcular la posición en el ranking
        higher_ranked_users = User.objects.filter(points__gt=request.user.points).count()
        user_data['position'] = higher_ranked_users + 1
        
        return Response(user_data)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Vista para listar y recuperar usuarios (sólo lectura).
    """
    queryset = User.objects.all().order_by('-points')
    serializer_class = UserSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'first_name', 'last_name']
    
    @action(detail=False, methods=['get'])
    def by_username(self, request):
        """
        Obtener un usuario por su nombre de usuario.
        Ejemplo: /api/users/by_username/?username=nombreusuario
        """
        username = request.query_params.get('username', None)
        if not username:
            return Response({'error': 'Se requiere el parámetro username.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(username=username)
            serializer = self.get_serializer(user)
            user_data = serializer.data
            
            # Añadir contador de posts, likes recibidos y comentarios
            user_data['posts_count'] = Post.objects.filter(author=user).count()
            
            post_likes = PostLike.objects.filter(post__author=user).count()
            comment_likes = CommentLike.objects.filter(comment__author=user).count()
            user_data['likes_received'] = post_likes + comment_likes
            
            user_data['comments_count'] = Comment.objects.filter(author=user).count()
            
            # Calcular la posición en el ranking (basado en puntos)
            higher_ranked_users = User.objects.filter(points__gt=user.points).count()
            user_data['position'] = higher_ranked_users + 1
            
            return Response(user_data)
        except User.DoesNotExist:
            return Response({'error': 'El usuario no existe.'}, 
                            status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        """
        Obtener los posts de un usuario específico.
        """
        user = self.get_object()
        posts = Post.objects.filter(author=user).order_by('-created_at')
        page = self.paginate_queryset(posts)
        
        if page is not None:
            serializer = PostSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)
        
    @action(detail=True, methods=['get'])
    def activity(self, request, pk=None):
        """
        Obtener la actividad reciente de un usuario (comentarios y likes).
        """
        user = self.get_object()
        
        # Obtener comentarios recientes
        comments = Comment.objects.filter(author=user).order_by('-created_at')[:10]
        comment_serializer = CommentSerializer(comments, many=True)
        
        # Obtener likes recientes
        post_likes = PostLike.objects.filter(user=user).order_by('-created_at')[:10]
        comment_likes = CommentLike.objects.filter(user=user).order_by('-created_at')[:10]
        
        post_likes_data = [
            {
                'type': 'post_like',
                'id': str(like.id),
                'created_at': like.created_at,
                'post': {
                    'id': str(like.post.id),
                    'title': like.post.title,
                    'content': like.post.content[:100] + ('...' if len(like.post.content) > 100 else '')
                }
            } for like in post_likes
        ]
        
        comment_likes_data = [
            {
                'type': 'comment_like',
                'id': str(like.id),
                'created_at': like.created_at,
                'comment': {
                    'id': str(like.comment.id),
                    'content': like.comment.content[:100] + ('...' if len(like.comment.content) > 100 else ''),
                    'post': {
                        'id': str(like.comment.post.id),
                        'title': like.comment.post.title
                    }
                }
            } for like in comment_likes
        ]
        
        # Combinar y ordenar por fecha
        activity = [
            *[{
                'type': 'comment',
                'id': str(comment['id']),
                'created_at': comment['created_at'],
                'content': comment['content'],
                'post': {
                    'id': comment['post'],
                    'title': Post.objects.get(id=comment['post']).title
                }
            } for comment in comment_serializer.data],
            *post_likes_data,
            *comment_likes_data
        ]
        
        # Convertir todas las fechas de created_at a string con formato ISO
        for item in activity:
            # Agregar log para depuración
            logger.debug(f"created_at type: {type(item['created_at'])} value: {item['created_at']}")
            
            # Asegurarse de que todos sean strings
            if isinstance(item['created_at'], datetime.datetime):
                item['created_at'] = item['created_at'].isoformat()
            elif not isinstance(item['created_at'], str):
                item['created_at'] = str(item['created_at'])
        
        # Ordenar por fecha de creación (más reciente primero)
        try:
            activity.sort(key=lambda x: x['created_at'], reverse=True)
        except Exception as e:
            logger.error(f"Error al ordenar actividad: {str(e)}")
            # En caso de error, intentar evitarlo devolviendo sin ordenar
            pass
        
        return Response(activity[:20])  # Limitamos a 20 actividades recientes
    
    @action(detail=True, methods=['get'])
    def comments_count(self, request, pk=None):
        """
        Obtener el número de comentarios de un usuario.
        """
        user = self.get_object()
        count = Comment.objects.filter(author=user).count()
        return Response({'count': count})
    
    @action(detail=True, methods=['get'], url_path='likes/received')
    def likes_received(self, request, pk=None):
        """
        Obtener el número de likes recibidos por un usuario en sus posts y comentarios.
        """
        user = self.get_object()
        
        # Contar likes en posts del usuario
        post_likes = PostLike.objects.filter(post__author=user).count()
        
        # Contar likes en comentarios del usuario
        comment_likes = CommentLike.objects.filter(comment__author=user).count()
        
        total_likes = post_likes + comment_likes
        
        return Response({'count': total_likes})


class LeaderboardView(generics.ListAPIView):
    """
    Vista para obtener el leaderboard de usuarios.
    """
    serializer_class = UserShortSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Obtener el período del leaderboard (all, month, week) desde la URL
        period = self.request.query_params.get('period', 'all')
        
        # Obtener los 10 usuarios con más puntos según el período
        queryset = User.objects.all()
        
        if period == 'week':
            # Aquí se implementaría la lógica para filtrar por actividad de la última semana
            # Por ahora, simplemente obtenemos todos ordenados por puntos
            pass
        elif period == 'month':
            # Aquí se implementaría la lógica para filtrar por actividad del último mes
            # Por ahora, simplemente obtenemos todos ordenados por puntos
            pass
        
        # Ordenamos por puntos (descendente) y tomamos los primeros 10
        return queryset.order_by('-points')[:10]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        
        # Añadir la posición a cada usuario
        leaderboard_data = serializer.data
        for i, user in enumerate(leaderboard_data, 1):
            user['position'] = i
            
            # Asegurar que 'points' existe en la respuesta
            if 'points' not in user:
                user['points'] = User.objects.get(id=user['id']).points
        
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
        # Guardar el autor como el usuario autenticado
        post = serializer.save(author=self.request.user)
        
        # Otorgar puntos por crear un post
        try:
            award_points(self.request.user, 'create_post', reference_id=str(post.id))
        except Exception as e:
            # Loggear el error pero permitir que la creación del post continúe
            logger.error(f"Error al otorgar puntos: {str(e)}")
            # No bloqueamos la creación del post si hay error en la gamificación

    def get_queryset(self):
        queryset = Post.objects.all()
        category = self.request.query_params.get('category', None)
        if category and category != 'all':
            queryset = queryset.filter(category__slug=category)
        return queryset
        
    def get_serializer_context(self):
        # Add the request to the serializer context
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
        
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """
        Obtener los comentarios de un post específico.
        """
        post = self.get_object()
        
        # Obtener comentarios raíz (sin padres) para este post
        root_comments = Comment.objects.filter(post=post, parent=None).order_by('created_at')
        
        # Usar directamente el serializador, que ya maneja la anidación
        # Pasar el contexto con request para construir URLs absolutas y verificar likes
        serializer = CommentSerializer(root_comments, many=True, context={
            'request': request,
            'depth': 0
        })
        
        return Response(serializer.data)


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
    
    def get_serializer_context(self):
        # Add the request to the serializer context
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        post_id = self.request.data.get('post_id')
        parent_id = self.request.data.get('parent_id')
        mentioned_user_id = self.request.data.get('mentioned_user_id')
        
        post = get_object_or_404(Post, id=post_id)
        parent = Comment.objects.filter(id=parent_id).first() if parent_id else None
        mentioned_user = User.objects.filter(id=mentioned_user_id).first() if mentioned_user_id else None
        
        comment = serializer.save(
            author=self.request.user,
            post=post,
            parent=parent,
            mentioned_user=mentioned_user
        )
        
        # Otorgar puntos por crear un comentario
        try:
            award_points(self.request.user, 'create_comment', reference_id=str(comment.id))
        except Exception as e:
            # Loggear el error pero permitir que la creación del comentario continúe
            logger.error(f"Error al otorgar puntos: {str(e)}")


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
            
            # Otorgar puntos al usuario que da like
            try:
                award_points(request.user, 'give_like_post', reference_id=str(post.id))
            
                # Si el autor no es el mismo usuario que da like, otorgar puntos al autor por recibir like
                if post.author != request.user:
                    award_points(post.author, 'receive_like_post', reference_id=str(post.id))
            except Exception as e:
                logger.error(f"Error al otorgar puntos por like: {str(e)}")
            
            return Response({'status': 'liked', 'likes': post.likes})
        else:
            # Si ya existe el like, lo eliminamos
            like.delete()
            
            # Decrementar contador de likes del post
            post.likes = max(0, post.likes - 1)
            post.save(update_fields=['likes'])
            
            # Nota: No restamos puntos al quitar likes para mantener la integridad del sistema
            
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
            
            # Otorgar puntos al usuario que da like
            try:
                award_points(request.user, 'give_like_comment', reference_id=str(comment.id))
            
                # Si el autor no es el mismo usuario que da like, otorgar puntos al autor por recibir like
                if comment.author != request.user:
                    award_points(comment.author, 'receive_like_comment', reference_id=str(comment.id))
            except Exception as e:
                logger.error(f"Error al otorgar puntos por like a comentario: {str(e)}")
            
            return Response({'status': 'liked', 'likes': comment.likes})
        else:
            # Si ya existe el like, lo eliminamos
            like.delete()
            
            # Decrementar contador de likes del comentario
            comment.likes = max(0, comment.likes - 1)
            comment.save(update_fields=['likes'])
            
            # Nota: No restamos puntos al quitar likes para mantener la integridad del sistema
            
            return Response({'status': 'unliked', 'likes': comment.likes})


class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint para Cursos.
    """
    queryset = Course.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def create(self, request, *args, **kwargs):
        """
        Crear un nuevo curso con mejor manejo de errores.
        """
        try:
            # Añadir log para depuración
            logger.info(f"Creating course with data: {request.data}")
            
            # Eliminar campo progress_percentage si está presente
            data = request.data.copy()
            if 'progress_percentage' in data:
                logger.info("Removing progress_percentage field from request data")
                data.pop('progress_percentage')
            
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                logger.error(f"Validation error when creating course: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error creating course: {str(e)}")
            return Response(
                {"error": f"Error al crear el curso: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer
        
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
        
    @action(detail=True, methods=['get'])
    def lessons(self, request, pk=None):
        """
        Obtener las lecciones de un curso específico.
        """
        course = self.get_object()
        lessons = Lesson.objects.filter(course=course).order_by('order')
        serializer = LessonSerializer(lessons, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def upload_thumbnail(self, request, pk=None):
        """
        Subir imagen de portada para un curso.
        """
        try:
            course = self.get_object()
            
            # Eliminar thumbnail anterior si existe
            if course.thumbnail and hasattr(course.thumbnail, 'path') and os.path.isfile(course.thumbnail.path):
                try:
                    os.remove(course.thumbnail.path)
                except Exception as e:
                    print(f"Error al eliminar thumbnail anterior: {e}")
            
            # Verificar si hay un archivo en la solicitud
            if 'thumbnail' not in request.FILES:
                return Response({"error": "No se ha proporcionado una imagen"}, status=status.HTTP_400_BAD_REQUEST)
                
            # Guardar nuevo thumbnail
            course.thumbnail = request.FILES['thumbnail']
            course.save()
            
            # Serializar respuesta
            serializer = self.get_serializer(course)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error al subir thumbnail: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LessonViewSet(viewsets.ModelViewSet):
    """
    API endpoint para Lecciones.
    """
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Lesson.objects.all()
        course_id = self.request.query_params.get('course_id', None)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset.order_by('order')
        
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class EventListView(APIView):
    """
    Vista para listar eventos
    """
    permission_classes = [AllowAny]
    
    def get(self, request, format=None):
        """
        Obtener todos los eventos 
        """
        # Opcionalmente filtrar por fecha
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        event_type = request.query_params.get('type')
        
        events = Event.objects.all()
        
        if start_date:
            events = events.filter(start_date__gte=start_date)
        
        if end_date:
            events = events.filter(start_date__lte=end_date)
            
        if event_type:
            events = events.filter(type=event_type)
            
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)
