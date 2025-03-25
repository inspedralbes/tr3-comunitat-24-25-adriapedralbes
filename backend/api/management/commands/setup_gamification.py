from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Configura el sistema de gamificación con datos iniciales'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Forzar la recreación completa del sistema de gamificación',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Iniciando configuración del sistema de gamificación...'))
        
        # Crear tablas manualmente
        self.create_tables()
        
        # Configurar datos iniciales
        self.setup_levels(options)
        self.setup_actions(options)
        self.setup_achievements(options)
        
        self.stdout.write(self.style.SUCCESS('Sistema de gamificación configurado correctamente'))
    
    def create_tables(self):
        """Crear tablas necesarias para el sistema de gamificación"""
        self.stdout.write('Creando tablas para el sistema de gamificación...')
        
        # Verificar si las tablas ya existen
        with connection.cursor() as cursor:
            cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'api_userlevel')")
            table_exists = cursor.fetchone()[0]
            
            if table_exists:
                self.stdout.write(self.style.WARNING('Las tablas ya existen. Omitiendo creación...'))
                return
        
        # Crear las tablas necesarias
        with connection.cursor() as cursor:
            # Tabla UserLevel
            cursor.execute("""
                CREATE TABLE api_userlevel (
                    id SERIAL PRIMARY KEY,
                    level INTEGER UNIQUE NOT NULL,
                    points_required INTEGER NOT NULL,
                    title VARCHAR(100) NULL,
                    badge_color VARCHAR(20) NOT NULL DEFAULT 'bg-blue-500',
                    icon VARCHAR(50) NULL,
                    description TEXT NULL
                )
            """)
            
            # Tabla UserAction
            cursor.execute("""
                CREATE TABLE api_useraction (
                    id SERIAL PRIMARY KEY,
                    action_type VARCHAR(30) NOT NULL,
                    points INTEGER NOT NULL,
                    description VARCHAR(255) NOT NULL,
                    is_active BOOLEAN NOT NULL DEFAULT TRUE
                )
            """)
            
            # Tabla UserAchievement
            cursor.execute("""
                CREATE TABLE api_userachievement (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    description TEXT NOT NULL,
                    achievement_type VARCHAR(20) NOT NULL,
                    icon VARCHAR(50) NOT NULL,
                    badge_color VARCHAR(20) NOT NULL DEFAULT 'bg-yellow-500',
                    points_reward INTEGER NOT NULL DEFAULT 0,
                    required_value INTEGER NOT NULL DEFAULT 1,
                    is_hidden BOOLEAN NOT NULL DEFAULT FALSE
                )
            """)
            
            # Tabla UserAchievementUnlock
            cursor.execute("""
                CREATE TABLE api_userachievementunlock (
                    id SERIAL PRIMARY KEY,
                    unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    achievement_id INTEGER NOT NULL REFERENCES api_userachievement(id) ON DELETE CASCADE,
                    user_id INTEGER NOT NULL REFERENCES api_user(id) ON DELETE CASCADE,
                    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
                )
            """)
            
            # Tabla UserActionLog
            cursor.execute("""
                CREATE TABLE api_useractionlog (
                    id SERIAL PRIMARY KEY,
                    points_earned INTEGER NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    reference_id VARCHAR(100) NULL,
                    action_id INTEGER NOT NULL REFERENCES api_useraction(id) ON DELETE CASCADE,
                    user_id INTEGER NOT NULL REFERENCES api_user(id) ON DELETE CASCADE
                )
            """)
        
        self.stdout.write(self.style.SUCCESS('Tablas creadas correctamente'))
    
    def setup_levels(self, options):
        """Configura los niveles de usuario"""
        self.stdout.write('Configurando niveles de usuario...')
        
        # Verificar si ya existen niveles
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM api_userlevel")
            count = cursor.fetchone()[0]
            
            if count > 0:
                if options.get('force', False):
                    cursor.execute("DELETE FROM api_userlevel")
                    self.stdout.write(self.style.WARNING('Niveles existentes eliminados forzosamente'))
                else:
                    self.stdout.write(self.style.WARNING('Ya existen niveles de usuario. Omitiendo...'))
                    return
        
        # Parámetros de la fórmula para calcular puntos necesarios por nivel
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
        with connection.cursor() as cursor:
            for i in range(1, 11):
                points_required = int(base * (i ** factor))
                # El nivel 1 comienza con 0 puntos
                if i == 1:
                    points_required = 0
                
                title = level_titles.get(i, f'Nivel {i}')
                badge_color = level_colors.get(i, 'bg-blue-500')
                description = f'Has alcanzado el nivel {i}. {title}'
                
                cursor.execute("""
                    INSERT INTO api_userlevel (level, points_required, title, badge_color, description)
                    VALUES (%s, %s, %s, %s, %s)
                """, [i, points_required, title, badge_color, description])
        
        self.stdout.write(self.style.SUCCESS(f'Creados 10 niveles de usuario'))
    
    def setup_actions(self, options):
        """Configura las acciones de usuario y sus recompensas"""
        self.stdout.write('Configurando acciones de usuario...')
        
        # Verificar si ya existen acciones
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM api_useraction")
            count = cursor.fetchone()[0]
            
            if count > 0:
                if options.get('force', False):
                    cursor.execute("DELETE FROM api_useraction")
                    self.stdout.write(self.style.WARNING('Acciones existentes eliminadas forzosamente'))
                else:
                    self.stdout.write(self.style.WARNING('Ya existen acciones de usuario. Omitiendo...'))
                    return
        
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
        with connection.cursor() as cursor:
            for action in actions:
                cursor.execute("""
                    INSERT INTO api_useraction (action_type, points, description, is_active)
                    VALUES (%s, %s, %s, %s)
                """, [action['action_type'], action['points'], action['description'], True])
        
        self.stdout.write(self.style.SUCCESS(f'Creadas {len(actions)} acciones de usuario'))
    
    def setup_achievements(self, options):
        """Configura los logros que pueden desbloquear los usuarios"""
        self.stdout.write('Configurando logros...')
        
        # Verificar si ya existen logros
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM api_userachievement")
            count = cursor.fetchone()[0]
            
            if count > 0:
                if options.get('force', False):
                    cursor.execute("DELETE FROM api_userachievement")
                    self.stdout.write(self.style.WARNING('Logros existentes eliminados forzosamente'))
                else:
                    self.stdout.write(self.style.WARNING('Ya existen logros. Omitiendo...'))
                    return
        
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
        with connection.cursor() as cursor:
            for achievement in achievements:
                cursor.execute("""
                    INSERT INTO api_userachievement (
                        name, description, achievement_type, icon, badge_color,
                        points_reward, required_value, is_hidden
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, [
                    achievement['name'],
                    achievement['description'],
                    achievement['achievement_type'],
                    achievement['icon'],
                    achievement['badge_color'],
                    achievement['points_reward'],
                    achievement['required_value'],
                    False
                ])
        
        self.stdout.write(self.style.SUCCESS(f'Creados {len(achievements)} logros'))
