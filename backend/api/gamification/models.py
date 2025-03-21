from django.db import models

class UserLevel(models.Model):
    """
    Modelo para almacenar los niveles y requisitos de puntos para los usuarios.
    """
    level = models.PositiveIntegerField(unique=True)
    points_required = models.PositiveIntegerField()
    title = models.CharField(max_length=100, blank=True, null=True)
    badge_color = models.CharField(max_length=20, default='bg-blue-500')
    icon = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['level']
        verbose_name = 'Nivel de Usuario'
        verbose_name_plural = 'Niveles de Usuario'
        app_label = 'api'  # Indicamos explícitamente que pertenece a la app 'api'
    
    def __str__(self):
        return f"Nivel {self.level} - {self.title or 'Sin título'}"


class UserAchievement(models.Model):
    """
    Modelo para almacenar logros conseguidos por los usuarios.
    """
    ACHIEVEMENT_TYPES = [
        ('post_count', 'Cantidad de Posts'),
        ('comment_count', 'Cantidad de Comentarios'),
        ('like_received', 'Likes Recibidos'),
        ('level_up', 'Subida de Nivel'),
        ('consecutive_days', 'Días Consecutivos'),
        ('special', 'Logro Especial'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES)
    icon = models.CharField(max_length=50)
    badge_color = models.CharField(max_length=20, default='bg-yellow-500')
    points_reward = models.PositiveIntegerField(default=0)
    required_value = models.PositiveIntegerField(default=1)
    is_hidden = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['achievement_type', 'required_value']
        verbose_name = 'Logro'
        verbose_name_plural = 'Logros'
        app_label = 'api'  # Indicamos explícitamente que pertenece a la app 'api'
    
    def __str__(self):
        return self.name


class UserAchievementUnlock(models.Model):
    """
    Modelo para registrar los logros desbloqueados por cada usuario.
    """
    user = models.ForeignKey('api.User', on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(UserAchievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'achievement')
        ordering = ['-unlocked_at']
        verbose_name = 'Logro Desbloqueado'
        verbose_name_plural = 'Logros Desbloqueados'
        app_label = 'api'  # Indicamos explícitamente que pertenece a la app 'api'
    
    def __str__(self):
        return f"{self.user.username} - {self.achievement.name}"


class UserAction(models.Model):
    """
    Modelo para registrar las acciones de los usuarios y sus recompensas.
    """
    ACTION_TYPES = [
        ('create_post', 'Crear Post'),
        ('create_comment', 'Crear Comentario'),
        ('receive_like_post', 'Recibir Like en Post'),
        ('receive_like_comment', 'Recibir Like en Comentario'),
        ('give_like_post', 'Dar Like a Post'),
        ('give_like_comment', 'Dar Like a Comentario'),
        ('daily_login', 'Acceso Diario'),
        ('achievement_unlock', 'Desbloquear Logro'),
    ]
    
    action_type = models.CharField(max_length=30, choices=ACTION_TYPES)
    points = models.PositiveIntegerField()
    description = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['action_type']
        verbose_name = 'Acción de Usuario'
        verbose_name_plural = 'Acciones de Usuario'
        app_label = 'api'  # Indicamos explícitamente que pertenece a la app 'api'
    
    def __str__(self):
        return f"{self.get_action_type_display()} - {self.points} puntos"


class UserActionLog(models.Model):
    """
    Modelo para registrar el historial de acciones de los usuarios.
    """
    user = models.ForeignKey('api.User', on_delete=models.CASCADE, related_name='action_logs')
    action = models.ForeignKey(UserAction, on_delete=models.CASCADE)
    points_earned = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    reference_id = models.CharField(max_length=100, blank=True, null=True)  # ID de referencia (post, comment, etc.)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Registro de Acción'
        verbose_name_plural = 'Registro de Acciones'
        app_label = 'api'  # Indicamos explícitamente que pertenece a la app 'api'
    
    def __str__(self):
        return f"{self.user.username} - {self.action.get_action_type_display()} - {self.points_earned} puntos"
