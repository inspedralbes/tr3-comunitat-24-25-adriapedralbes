from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q

from .models import Post, Category, User
from .serializers import UserSerializer, UserShortSerializer

# Añadir viewsets para los modelos existentes
class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint para administrar posts.
    """
    queryset = Post.objects.all()
    serializer_class = None  # Se necesita implementar el serializador
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint para administrar categorías.
    """
    queryset = Category.objects.all()
    serializer_class = None  # Se necesita implementar el serializador
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para ver usuarios.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserRegistrationView(APIView):
    """
    API endpoint para registro de usuarios.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        # Implementar lógica de registro
        return Response({"detail": "Registro no implementado aún"}, status=status.HTTP_501_NOT_IMPLEMENTED)

class UserMeView(APIView):
    """
    API endpoint para obtener o actualizar datos del usuario autenticado.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Endpoint para búsqueda de usuarios (para la mensajería)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_users(request):
    """
    Busca usuarios por nombre de usuario
    """
    query = request.query_params.get('q', '')
    
    if len(query) < 3:
        return Response({"error": "El término de búsqueda debe tener al menos 3 caracteres"}, 
                        status=status.HTTP_400_BAD_REQUEST)
    
    # Buscar usuarios que coincidan con el término de búsqueda
    users = User.objects.filter(
        Q(username__icontains=query) | 
        Q(first_name__icontains=query) | 
        Q(last_name__icontains=query)
    ).exclude(id=request.user.id)[:10]  # Excluir al usuario actual y limitar a 10 resultados
    
    serializer = UserShortSerializer(users, many=True)
    
    return Response(serializer.data)
