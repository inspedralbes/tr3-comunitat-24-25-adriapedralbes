from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics
from django.shortcuts import get_object_or_404

from api.models import User
from .models import UserLevel, UserAchievement, UserAchievementUnlock
from .services import get_points_to_next_level, get_user_achievements, award_points

from api.serializers import UserSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_progression(request):
    """
    Obtiene información sobre la progresión del usuario actual:
    - Nivel actual
    - Puntos actuales
    - Puntos necesarios para el siguiente nivel
    - Porcentaje de progreso
    """
    user = request.user
    progression_info = get_points_to_next_level(user)
    
    return Response(progression_info)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_achievements_view(request):
    """
    Obtiene los logros desbloqueados por el usuario actual.
    """
    user = request.user
    achievements = get_user_achievements(user)
    
    return Response({
        'user_id': user.id,
        'username': user.username,
        'level': user.level,
        'points': user.points,
        'achievements': achievements
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_daily_login(request):
    """
    Registra el acceso diario del usuario y otorga puntos.
    """
    user = request.user
    
    # Otorgar puntos por acceso diario
    result = award_points(user, 'daily_login')
    
    return Response(result)


@api_view(['GET'])
def leaderboard_levels(request):
    """
    Obtiene el leaderboard de niveles de usuario.
    """
    # Obtener información de todos los niveles
    levels = UserLevel.objects.all().order_by('level')
    
    level_data = []
    for level in levels:
        level_data.append({
            'level': level.level,
            'title': level.title,
            'points_required': level.points_required,
            'badge_color': level.badge_color,
            'icon': level.icon,
            'description': level.description
        })
    
    return Response(level_data)


@api_view(['GET'])
def achievement_list(request):
    """
    Obtiene la lista de todos los logros disponibles.
    """
    # Si el usuario está autenticado, marca los logros que ya ha desbloqueado
    user = request.user if request.user.is_authenticated else None
    
    # Obtener todos los logros que no están ocultos
    achievements = UserAchievement.objects.filter(is_hidden=False).order_by('achievement_type', 'required_value')
    
    # Si el usuario está autenticado, obtener sus logros desbloqueados
    unlocked_ids = set()
    if user:
        unlocked_ids = set(UserAchievementUnlock.objects.filter(
            user=user
        ).values_list('achievement_id', flat=True))
    
    # Preparar datos para la respuesta
    achievement_data = []
    for achievement in achievements:
        achievement_data.append({
            'id': achievement.id,
            'name': achievement.name,
            'description': achievement.description,
            'achievement_type': achievement.achievement_type,
            'icon': achievement.icon,
            'badge_color': achievement.badge_color,
            'points_reward': achievement.points_reward,
            'required_value': achievement.required_value,
            'unlocked': achievement.id in unlocked_ids if user else False
        })
    
    return Response(achievement_data)
