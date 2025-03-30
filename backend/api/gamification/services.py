from django.db.models import F, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import UserLevel, UserAction, UserActionLog, UserAchievement, UserAchievementUnlock
import logging

# Importar servicio de sockets
from api.sockets import emit_ranking_update

# Configurar logger
logger = logging.getLogger(__name__)

def award_points(user, action_type, reference_id=None):
    """
    Otorga puntos a un usuario por una acción específica.
    
    Args:
        user: Instancia del modelo User
        action_type: Tipo de acción (create_post, create_comment, etc.)
        reference_id: ID de referencia opcional (ID del post, comentario, etc.)
        
    Returns:
        dict: Información sobre los puntos ganados y posible subida de nivel
    """
    try:
        # Buscar la acción correspondiente y sus puntos asociados
        try:
            action = UserAction.objects.get(action_type=action_type, is_active=True)
        except UserAction.DoesNotExist:
            # Si la acción no está configurada, no hacemos nada
            logger.warning(f"Acción {action_type} no configurada en el sistema")
            return {'success': False, 'message': f'Acción {action_type} no configurada en el sistema'}
        
        # Registrar la acción en el log y otorgar puntos
        action_log = UserActionLog.objects.create(
            user=user,
            action=action,
            points_earned=action.points,
            reference_id=reference_id
        )
        
        # Actualizar los puntos del usuario
        old_points = user.points
        user.points = F('points') + action.points
        user.save(update_fields=['points'])
        user.refresh_from_db()  # Recargar para tener el valor actualizado
        
        # Comprobar si el usuario ha subido de nivel
        level_up_info = check_level_up(user, old_points)
        
        # Comprobar si ha desbloqueado logros
        check_achievements(user)
        
        # Calcular la posición en el ranking después de recibir los puntos
        from api.models import User
        higher_ranked_users = User.objects.filter(points__gt=user.points).count()
        new_position = higher_ranked_users + 1
        
        # Emitir evento de actualización de ranking
        try:
            # Preparar datos del usuario para la actualización
            avatar_url = None
            if user.avatar_url:
                try:
                    avatar_url = user.avatar_url.url
                except Exception as e:
                    logger.error(f"Error obteniendo URL de avatar: {str(e)}")
            elif user.avatar_url_external:
                avatar_url = user.avatar_url_external
                
            # Incluir timestamp para que el frontend pueda distinguir eventos en tiempo real
            from datetime import datetime
            user_data = {
                'id': str(user.id),  # Convertir a string para evitar problemas de serialización
                'username': user.username,
                'points': user.points,
                'level': user.level,
                'position': new_position,
                'avatar_url': avatar_url,
                'timestamp': datetime.now().isoformat()  # Añadir timestamp ISO
            }
            
            emit_ranking_update(user_data)
            logger.info(f"Evento de ranking emitido para {user.username} (posición: {new_position})")
        except Exception as e:
            logger.error(f"Error al emitir evento de ranking: {str(e)}")
        
        return {
            'success': True, 
            'points_earned': action.points,
            'total_points': user.points,
            'level_up': level_up_info.get('level_up', False),
            'new_level': level_up_info.get('new_level'),
            'position': new_position
        }
    except Exception as e:
        logger.error(f"Error al otorgar puntos: {str(e)}")
        return {'success': False, 'message': str(e)}

def check_level_up(user, old_points):
    """
    Comprueba si el usuario ha subido de nivel con los puntos ganados.
    
    Args:
        user: Instancia del modelo User
        old_points: Puntos anteriores del usuario
        
    Returns:
        dict: Información sobre la subida de nivel (si ocurrió)
    """
    try:
        # Obtener todos los niveles que requieren menos puntos que los que tiene el usuario
        possible_levels = UserLevel.objects.filter(points_required__lte=user.points).order_by('-level')
        
        if not possible_levels.exists():
            return {'level_up': False}
        
        # El nivel más alto que el usuario puede tener
        highest_possible_level = possible_levels.first()
        
        # Si el usuario ya tiene este nivel o mayor, no hay subida
        if user.level >= highest_possible_level.level:
            return {'level_up': False}
        
        # Guardar el nivel anterior para retornarlo
        old_level = user.level
        
        # Actualizar el nivel del usuario
        user.level = highest_possible_level.level
        user.save(update_fields=['level'])
        
        # Crear registro de acción por subir de nivel
        level_up_action = UserAction.objects.filter(action_type='achievement_unlock').first()
        if level_up_action:
            UserActionLog.objects.create(
                user=user,
                action=level_up_action,
                points_earned=level_up_action.points,
                reference_id=f"level_up_{highest_possible_level.level}"
            )
            # Actualizar puntos por el logro de subir de nivel
            user.points = F('points') + level_up_action.points
            user.save(update_fields=['points'])
            user.refresh_from_db()
        
        return {
            'level_up': True,
            'old_level': old_level,
            'new_level': highest_possible_level.level,
            'level_info': {
                'title': highest_possible_level.title,
                'description': highest_possible_level.description,
                'badge_color': highest_possible_level.badge_color,
                'icon': highest_possible_level.icon,
            }
        }
    except Exception as e:
        logger.error(f"Error al comprobar subida de nivel: {str(e)}")
        return {'level_up': False, 'error': str(e)}

def check_achievements(user):
    """
    Verifica si el usuario ha conseguido nuevos logros.
    
    Args:
        user: Instancia del modelo User
        
    Returns:
        list: Lista de nuevos logros desbloqueados
    """
    try:
        # Logros ya desbloqueados por el usuario
        unlocked_achievements = set(UserAchievementUnlock.objects.filter(
            user=user
        ).values_list('achievement_id', flat=True))
        
        # Todos los logros disponibles que el usuario no ha desbloqueado aún
        available_achievements = UserAchievement.objects.exclude(
            id__in=unlocked_achievements
        )
        
        newly_unlocked = []
        
        for achievement in available_achievements:
            if has_completed_achievement(user, achievement):
                # Desbloquear el logro
                UserAchievementUnlock.objects.create(
                    user=user,
                    achievement=achievement
                )
                
                # Otorgar puntos por el logro
                if achievement.points_reward > 0:
                    user.points = F('points') + achievement.points_reward
                    user.save(update_fields=['points'])
                    user.refresh_from_db()
                
                newly_unlocked.append({
                    'id': achievement.id,
                    'name': achievement.name,
                    'description': achievement.description,
                    'icon': achievement.icon,
                    'badge_color': achievement.badge_color,
                    'points_reward': achievement.points_reward
                })
        
        return newly_unlocked
    except Exception as e:
        logger.error(f"Error al comprobar logros: {str(e)}")
        return []

def has_completed_achievement(user, achievement):
    """
    Verifica si un usuario ha cumplido los requisitos para un logro específico.
    
    Args:
        user: Instancia del modelo User
        achievement: Instancia del modelo UserAchievement
        
    Returns:
        bool: True si el usuario ha cumplido los requisitos, False en caso contrario
    """
    from api.models import Post, Comment, PostLike, CommentLike
    
    # Verificar según el tipo de logro
    if achievement.achievement_type == 'post_count':
        post_count = Post.objects.filter(author=user).count()
        return post_count >= achievement.required_value
        
    elif achievement.achievement_type == 'comment_count':
        comment_count = Comment.objects.filter(author=user).count()
        return comment_count >= achievement.required_value
        
    elif achievement.achievement_type == 'like_received':
        # Contar likes recibidos en posts y comentarios
        post_likes = Post.objects.filter(author=user).aggregate(
            total_likes=Count('user_likes')
        )['total_likes'] or 0
        
        comment_likes = Comment.objects.filter(author=user).aggregate(
            total_likes=Count('user_likes')
        )['total_likes'] or 0
        
        total_likes = post_likes + comment_likes
        return total_likes >= achievement.required_value
        
    elif achievement.achievement_type == 'level_up':
        # Verificar si el usuario ha alcanzado cierto nivel
        return user.level >= achievement.required_value
        
    elif achievement.achievement_type == 'consecutive_days':
        # Este requeriría un sistema adicional para rastrear días consecutivos
        # Como aproximación, podemos ver si tiene actividad en los últimos N días
        # No es exactamente días consecutivos, pero es una aproximación
        days_required = achievement.required_value
        activity_dates = set()
        
        # Revisar actividad en los últimos X días (X siendo más que los días requeridos)
        check_period = days_required * 2  # Verificamos el doble de días para flexibilidad
        
        # Obtener fechas de actividad reciente (posts, comentarios)
        from django.db.models import DateField
        from django.db.models.functions import TruncDate
        
        # Fechas de posts
        post_dates = Post.objects.filter(
            author=user, 
            created_at__gte=timezone.now() - timedelta(days=check_period)
        ).annotate(
            date=TruncDate('created_at')
        ).values_list('date', flat=True)
        
        # Fechas de comentarios
        comment_dates = Comment.objects.filter(
            author=user,
            created_at__gte=timezone.now() - timedelta(days=check_period)
        ).annotate(
            date=TruncDate('created_at')
        ).values_list('date', flat=True)
        
        # Fechas de likes dados
        like_dates = PostLike.objects.filter(
            user=user,
            created_at__gte=timezone.now() - timedelta(days=check_period)
        ).annotate(
            date=TruncDate('created_at')
        ).values_list('date', flat=True)
        
        # Combinar todas las fechas
        all_dates = set(list(post_dates) + list(comment_dates) + list(like_dates))
        
        # Verificar si hay suficientes fechas únicas
        return len(all_dates) >= achievement.required_value
        
    # Para logros especiales, se manejarían de forma personalizada
    return False

def get_points_to_next_level(user):
    """
    Obtiene la cantidad de puntos que necesita el usuario para subir al siguiente nivel.
    
    Args:
        user: Instancia del modelo User
        
    Returns:
        dict: Información sobre el siguiente nivel y puntos necesarios
    """
    # Obtener el siguiente nivel
    next_level = UserLevel.objects.filter(
        level__gt=user.level
    ).order_by('level').first()
    
    if not next_level:
        return {
            'current_level': user.level,
            'max_level_reached': True,
            'current_points': user.points
        }
    
    # Calcular puntos necesarios
    points_needed = next_level.points_required - user.points
    
    return {
        'current_level': user.level,
        'next_level': next_level.level,
        'points_needed': points_needed,
        'current_points': user.points,
        'next_level_points': next_level.points_required,
        'progress_percentage': (user.points / next_level.points_required) * 100,
        'next_level_info': {
            'title': next_level.title,
            'description': next_level.description,
            'badge_color': next_level.badge_color,
            'icon': next_level.icon,
        }
    }

def get_user_achievements(user):
    """
    Obtiene los logros desbloqueados por un usuario.
    
    Args:
        user: Instancia del modelo User
        
    Returns:
        list: Lista de logros desbloqueados
    """
    unlocked = UserAchievementUnlock.objects.filter(user=user).select_related('achievement')
    
    achievements = [{
        'id': unlock.achievement.id,
        'name': unlock.achievement.name,
        'description': unlock.achievement.description,
        'icon': unlock.achievement.icon,
        'badge_color': unlock.achievement.badge_color,
        'unlocked_at': unlock.unlocked_at,
        'points_reward': unlock.achievement.points_reward
    } for unlock in unlocked]
    
    return achievements
