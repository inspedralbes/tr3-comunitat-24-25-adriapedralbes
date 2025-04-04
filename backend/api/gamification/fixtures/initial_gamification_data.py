from django.core.management.base import BaseCommand
from api.gamification.models import UserLevel, UserAction, UserAchievement

class Command(BaseCommand):
    help = 'Crea los datos iniciales para el sistema de gamificación'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creando niveles de usuario...')
        create_user_levels()
        
        self.stdout.write('Creando acciones de usuario...')
        create_user_actions()
        
        self.stdout.write('Creando logros...')
        create_achievements()
        
        self.stdout.write(self.style.SUCCESS('Datos iniciales de gamificación creados correctamente'))


def create_user_levels():
    """
    Crea los niveles de usuario con sus requisitos de puntos.
    La fórmula para los puntos requeridos sigue una progresión exponencial:
    puntos = base * (nivel ^ factor)
    """
    # Limpiar niveles existentes
    UserLevel.objects.all().delete()
    
    # Parámetros de la fórmula
    base = 100
    factor = 1.5
    
    # Títulos y colores para los niveles
    level_titles = {
        1: 'Novato',
        2: 'Aprendiz',
        3: 'Participante',
        4: 'Contribuidor',
        5: 'Experto',
        6: 'Especialista',
        7: 'Maestro',
        8: 'Gurú',
        9: 'Leyenda',
        10: 'Visionario',
    }
    
    level_colors = {
        1: 'bg-gray-500',
        2: 'bg-green-500',
        3: 'bg-blue-500',
        4: 'bg-indigo-500',
        5: 'bg-purple-500',
        6: 'bg-pink-500',
        7: 'bg-red-500',
        8: 'bg-yellow-500',
        9: 'bg-amber-500',
        10: 'bg-orange-500',
    }
    
    # Crear niveles (1-10)
    levels = []
    for i in range(1, 11):
        points_required = int(base * (i ** factor))
        # El nivel 1 comienza con 0 puntos
        if i == 1:
            points_required = 0
            
        levels.append(UserLevel(
            level=i,
            points_required=points_required,
            title=level_titles.get(i, f'Nivel {i}'),
            badge_color=level_colors.get(i, 'bg-blue-500'),
            description=f'Has alcanzado el nivel {i}. {level_titles.get(i, "")}'
        ))
    
    # Crear en bulk
    UserLevel.objects.bulk_create(levels)
    
    print(f"Creados {len(levels)} niveles de usuario")


def create_user_actions():
    """
    Crea las acciones de usuario con sus recompensas de puntos.
    """
    # Limpiar acciones existentes
    UserAction.objects.all().delete()
    
    # Definir acciones y sus puntos
    actions = [
        {
            'action_type': 'create_post',
            'points': 10,
            'description': 'Crear un nuevo post en la comunidad'
        },
        {
            'action_type': 'create_comment',
            'points': 5,
            'description': 'Comentar en un post de la comunidad'
        },
        {
            'action_type': 'receive_like_post',
            'points': 3,
            'description': 'Recibir un like en un post'
        },
        {
            'action_type': 'receive_like_comment',
            'points': 2,
            'description': 'Recibir un like en un comentario'
        },
        {
            'action_type': 'give_like_post',
            'points': 1,
            'description': 'Dar like a un post'
        },
        {
            'action_type': 'give_like_comment',
            'points': 1,
            'description': 'Dar like a un comentario'
        },
        {
            'action_type': 'daily_login',
            'points': 2,
            'description': 'Iniciar sesión diariamente'
        },
        {
            'action_type': 'achievement_unlock',
            'points': 15,
            'description': 'Desbloquear un logro o subir de nivel'
        },
    ]
    
    # Crear acciones
    action_objects = [UserAction(**action) for action in actions]
    UserAction.objects.bulk_create(action_objects)
    
    print(f"Creadas {len(action_objects)} acciones de usuario")


def create_achievements():
    """
    Crea los logros que pueden desbloquear los usuarios.
    """
    # Limpiar logros existentes
    UserAchievement.objects.all().delete()
    
    # Definir logros
    achievements = [
        # Logros de cantidad de posts
        {
            'name': 'Primer Post',
            'description': 'Has creado tu primer post en la comunidad',
            'achievement_type': 'post_count',
            'icon': 'chat-bubble',
            'badge_color': 'bg-green-500',
            'points_reward': 20,
            'required_value': 1
        },
        {
            'name': 'Contribuidor Activo',
            'description': 'Has creado 10 posts en la comunidad',
            'achievement_type': 'post_count',
            'icon': 'chat-bubble-dots',
            'badge_color': 'bg-green-600',
            'points_reward': 50,
            'required_value': 10
        },
        {
            'name': 'Creador de Contenido',
            'description': 'Has creado 50 posts en la comunidad',
            'achievement_type': 'post_count',
            'icon': 'document',
            'badge_color': 'bg-green-700',
            'points_reward': 100,
            'required_value': 50
        },
        {
            'name': 'Generador de Ideas',
            'description': 'Has creado 100 posts en la comunidad',
            'achievement_type': 'post_count',
            'icon': 'light-bulb',
            'badge_color': 'bg-green-800',
            'points_reward': 200,
            'required_value': 100
        },
        
        # Logros de comentarios
        {
            'name': 'Primer Comentario',
            'description': 'Has dejado tu primer comentario',
            'achievement_type': 'comment_count',
            'icon': 'chat',
            'badge_color': 'bg-blue-500',
            'points_reward': 15,
            'required_value': 1
        },
        {
            'name': 'Conversador',
            'description': 'Has dejado 25 comentarios',
            'achievement_type': 'comment_count',
            'icon': 'chat',
            'badge_color': 'bg-blue-600',
            'points_reward': 40,
            'required_value': 25
        },
        {
            'name': 'Comunicador',
            'description': 'Has dejado 100 comentarios',
            'achievement_type': 'comment_count',
            'icon': 'chat-dots',
            'badge_color': 'bg-blue-700',
            'points_reward': 80,
            'required_value': 100
        },
        
        # Logros de likes recibidos
        {
            'name': 'Primera Apreciación',
            'description': 'Recibiste tu primer like',
            'achievement_type': 'like_received',
            'icon': 'thumb-up',
            'badge_color': 'bg-yellow-500',
            'points_reward': 10,
            'required_value': 1
        },
        {
            'name': 'Contenido Valioso',
            'description': 'Has recibido 25 likes en total',
            'achievement_type': 'like_received',
            'icon': 'thumb-up',
            'badge_color': 'bg-yellow-600',
            'points_reward': 50,
            'required_value': 25
        },
        {
            'name': 'Creador Respetado',
            'description': 'Has recibido 100 likes en total',
            'achievement_type': 'like_received',
            'icon': 'thumb-up',
            'badge_color': 'bg-yellow-700',
            'points_reward': 100,
            'required_value': 100
        },
        {
            'name': 'Influencer',
            'description': 'Has recibido 500 likes en total',
            'achievement_type': 'like_received',
            'icon': 'star',
            'badge_color': 'bg-yellow-800',
            'points_reward': 200,
            'required_value': 500
        },
        
        # Logros de nivel
        {
            'name': 'Paso Firme',
            'description': 'Has alcanzado el nivel 3',
            'achievement_type': 'level_up',
            'icon': 'level-up',
            'badge_color': 'bg-purple-500',
            'points_reward': 30,
            'required_value': 3
        },
        {
            'name': 'Miembro Destacado',
            'description': 'Has alcanzado el nivel 5',
            'achievement_type': 'level_up',
            'icon': 'level-up',
            'badge_color': 'bg-purple-600',
            'points_reward': 50,
            'required_value': 5
        },
        {
            'name': 'Referente',
            'description': 'Has alcanzado el nivel 7',
            'achievement_type': 'level_up',
            'icon': 'trophy',
            'badge_color': 'bg-purple-700',
            'points_reward': 100,
            'required_value': 7
        },
        {
            'name': 'Eminencia',
            'description': 'Has alcanzado el nivel 10',
            'achievement_type': 'level_up',
            'icon': 'crown',
            'badge_color': 'bg-purple-800',
            'points_reward': 200,
            'required_value': 10
        },
        
        # Logros de días consecutivos
        {
            'name': 'Visitante Habitual',
            'description': 'Has estado activo durante 3 días',
            'achievement_type': 'consecutive_days',
            'icon': 'calendar-check',
            'badge_color': 'bg-red-500',
            'points_reward': 15,
            'required_value': 3
        },
        {
            'name': 'Miembro Consistente',
            'description': 'Has estado activo durante 7 días',
            'achievement_type': 'consecutive_days',
            'icon': 'calendar-check',
            'badge_color': 'bg-red-600',
            'points_reward': 30,
            'required_value': 7
        },
        {
            'name': 'Miembro Dedicado',
            'description': 'Has estado activo durante 30 días',
            'achievement_type': 'consecutive_days',
            'icon': 'calendar-check',
            'badge_color': 'bg-red-700',
            'points_reward': 100,
            'required_value': 30
        },
    ]
    
    # Crear logros
    achievement_objects = [UserAchievement(**achievement) for achievement in achievements]
    UserAchievement.objects.bulk_create(achievement_objects)
    
    print(f"Creados {len(achievement_objects)} logros")
