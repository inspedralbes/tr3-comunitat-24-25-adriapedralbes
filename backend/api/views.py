from rest_framework import status, viewsets, permissions, generics, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count
from django.shortcuts import get_object_or_404

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

# Vista para la ruta raíz
@api_view(['GET'])
@add_cors_headers
def api_root(request):
    """
    Vista para la página principal de la API
    """
    return Response({
        'status': 'online',
        'message': 'Bienvenido a la API de FuturPrive',
        'version': '1.0',
        'endpoints': {
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

@api_view(['POST'])
def subscribe(request):
    """
    API endpoint para suscribirse a la newsletter.
    """
    # Asegurarnos de que tenemos encabezados CORS para esta vista
    if request.method == 'OPTIONS':
        response = Response({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Headers"] = "*"
        response["Access-Control-Allow-Methods"] = "*"
        return response
        
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
            
            # Añadir encabezados CORS
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Headers"] = "*"
            response["Access-Control-Allow-Methods"] = "*"
            
            return response
            
        except Exception as e:
            # Logging detallado del error
            logger = logging.getLogger(__name__)
            logger.error(f"Error enviando email a {subscriber.email}: {str(e)}")
            logger.error(traceback.format_exc())
            
            # Diagnóstico de conexión
            try:
                connection_test = test_email_connection()
                error_details = {
                    'error_type': type(e).__name__,
                    'error_message': str(e),
                    'email_settings': {
                        'EMAIL_HOST': settings.EMAIL_HOST,
                        'EMAIL_PORT': settings.EMAIL_PORT,
                        'EMAIL_USE_TLS': settings.EMAIL_USE_TLS,
                        'EMAIL_USE_SSL': settings.EMAIL_USE_SSL,
                    },
                    'connection_test': connection_test
                }
                print("========= EMAIL ERROR DIAGNOSIS =========")
                print(json.dumps(error_details, indent=2))
                print("=======================================")
            except Exception as debug_error:
                print(f"Error during email diagnostics: {debug_error}")
            
            # Guardamos el suscriptor pero informamos del problema con el correo
            response = Response({
                'success': False,
                'message': 'Hubo un problema al enviar el correo de confirmación, pero tus datos se han guardado. El administrador te contactará para confirmar.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Añadir encabezados CORS
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Headers"] = "*"
            response["Access-Control-Allow-Methods"] = "*"
            
            return response
    
    response = Response({
        'success': False,
        'message': 'Los datos proporcionados no son válidos.',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
    
    # Añadir encabezados CORS
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Headers"] = "*"
    response["Access-Control-Allow-Methods"] = "*"
    
    return response


@api_view(['GET'])
@add_cors_headers
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
            
            response = Response({
                'success': True,
                'message': '¡Gracias! Tu suscripción ha sido confirmada con éxito.'
            })
            
            # Añadir encabezados CORS
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Headers"] = "*"
            response["Access-Control-Allow-Methods"] = "*"
            
            return response
        
        response = Response({
            'success': True,
            'message': 'Tu suscripción ya ha sido confirmada anteriormente.'
        })
        
        # Añadir encabezados CORS
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Headers"] = "*"
        response["Access-Control-Allow-Methods"] = "*"
        
        return response
        
    except Subscriber.DoesNotExist:
        response = Response({
            'success': False,
            'message': 'El token de confirmación no es válido.'
        }, status=status.HTTP_404_NOT_FOUND)
        
        # Añadir encabezados CORS
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Headers"] = "*"
        response["Access-Control-Allow-Methods"] = "*"
        
        return response


@api_view(['GET', 'POST', 'OPTIONS'])
@add_cors_headers
def unsubscribe(request, token):
    """
    API endpoint para cancelar la suscripción.
    """
    # Asegurarnos de que tenemos encabezados CORS para esta vista
    if request.method == 'OPTIONS':
        response = Response({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Headers"] = "*"
        response["Access-Control-Allow-Methods"] = "*"
        return response
        
    try:
        subscriber = Subscriber.objects.get(confirmation_token=token)
        email = subscriber.email
        subscriber.delete()
        
        response = Response({
            'success': True,
            'message': f'El correo {email} ha sido eliminado de nuestra lista.'
        })
        
        # Añadir encabezados CORS
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Headers"] = "*"
        response["Access-Control-Allow-Methods"] = "*"
        
        return response
        
    except Subscriber.DoesNotExist:
        response = Response({
            'success': False,
            'message': 'El token de cancelación no es válido.'
        }, status=status.HTTP_404_NOT_FOUND)
        
        # Añadir encabezados CORS
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Headers"] = "*"
        response["Access-Control-Allow-Methods"] = "*"
        
        return response


def send_confirmation_email(subscriber):
    """
    Envía un email de confirmación al suscriptor.
    """
    confirmation_link = f"{settings.SITE_URL}/api/newsletter/confirm/{subscriber.confirmation_token}"
    unsubscribe_link = f"{settings.SITE_URL}/api/newsletter/unsubscribe/{subscriber.confirmation_token}/"
    
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
