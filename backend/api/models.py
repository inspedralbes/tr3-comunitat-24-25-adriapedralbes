from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager
import uuid
from django.core.serializers.json import DjangoJSONEncoder
from django.utils import timezone

class Subscriber(models.Model):
    """
    Modelo para almacenar los suscriptores de la newsletter.
    """
    name = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True)
    confirmation_token = models.UUIDField(default=uuid.uuid4, editable=False)
    confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Suscriptor'
        verbose_name_plural = 'Suscriptores'
    
    def __str__(self):
        return self.email


class CustomUserManager(UserManager):
    pass


class User(AbstractUser):
    """
    Modelo personalizado de usuario para la comunidad.
    Extiende AbstractUser para usar la autenticación estándar de Django.
    """
    avatar_url = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    level = models.PositiveIntegerField(default=1)
    points = models.PositiveIntegerField(default=0)
    website = models.URLField(blank=True, null=True)
    position = models.PositiveIntegerField(default=0, blank=True, null=True)  # Posición en el ranking
    is_premium = models.BooleanField(default=False)  # Si el usuario es premium
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Campos para Stripe
    stripe_customer_id = models.CharField(max_length=100, blank=True, null=True)
    has_active_subscription = models.BooleanField(default=False)
    subscription_id = models.CharField(max_length=100, blank=True, null=True)
    subscription_status = models.CharField(max_length=50, blank=True, null=True)  # 'active', 'canceled', 'past_due', etc.
    subscription_start_date = models.DateTimeField(blank=True, null=True)
    subscription_end_date = models.DateTimeField(blank=True, null=True)
    
    objects = CustomUserManager()
    
    class Meta:
        ordering = ['-points']
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
    
    def __str__(self):
        return self.username


class Category(models.Model):
    """
    Categorías para los posts de la comunidad.
    """
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True)
    color = models.CharField(max_length=20, default='bg-zinc-700')  # Color CSS para la categoría
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
    
    def __str__(self):
        return self.name


class Post(models.Model):
    """
    Posts creados por los usuarios en la comunidad.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    title = models.CharField(max_length=255, blank=True, null=True)
    content = models.TextField()
    image = models.ImageField(upload_to='post_images/', blank=True, null=True)
    likes = models.PositiveIntegerField(default=0)
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_pinned', '-created_at']
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'
    
    def __str__(self):
        return f"{self.author.username}: {self.content[:50]}"


class Comment(models.Model):
    """
    Comentarios en los posts.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    likes = models.PositiveIntegerField(default=0)
    mentioned_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='mentions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = 'Comentario'
        verbose_name_plural = 'Comentarios'
    
    def __str__(self):
        return f"{self.author.username}: {self.content[:50]}"


class PostLike(models.Model):
    """
    Registro de likes en posts.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post_likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='user_likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'post')
        verbose_name = 'Like de Post'
        verbose_name_plural = 'Likes de Posts'
    
    def __str__(self):
        return f"{self.user.username} liked {self.post.id}"


class CommentLike(models.Model):
    """
    Registro de likes en comentarios.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comment_likes')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='user_likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'comment')
        verbose_name = 'Like de Comentario'
        verbose_name_plural = 'Likes de Comentarios'
    
    def __str__(self):
        return f"{self.user.username} liked comment {self.comment.id}"


class Course(models.Model):
    """
    Cursos de la plataforma.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)
    progress_percentage = models.IntegerField(default=0)  # Para seguimiento de progreso
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Curso'
        verbose_name_plural = 'Cursos'
    
    def __str__(self):
        return self.title


class Lesson(models.Model):
    """
    Lecciones de los cursos.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, related_name='lessons', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.JSONField(default=dict, encoder=DjangoJSONEncoder)  # Para contenido enriquecido
    order = models.PositiveIntegerField(default=0)  # Para ordenar lecciones dentro de un curso
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']
        verbose_name = 'Lección'
        verbose_name_plural = 'Lecciones'
    
    def __str__(self):
        return self.title

# Nuevos modelos para el progreso del usuario

class UserLessonProgress(models.Model):
    """
    Modelo para rastrear el progreso del usuario en lecciones individuales.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='user_progress')
    completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)
    time_spent_seconds = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'lesson')
        verbose_name = 'Progreso de Lección'
        verbose_name_plural = 'Progresos de Lecciones'
    
    def __str__(self):
        status = "Completada" if self.completed else "En progreso"
        return f"{self.user.username} - {self.lesson.title[:30]} - {status}"
        
    def save(self, *args, **kwargs):
        # Si se marca como completada y no tiene fecha de completado, asignarla
        if self.completed and not self.completion_date:
            self.completion_date = timezone.now()
        # Si se marca como no completada, eliminar la fecha de completado
        elif not self.completed and self.completion_date:
            self.completion_date = None
            
        super().save(*args, **kwargs)


class UserCourseProgress(models.Model):
    """
    Modelo para rastrear el progreso global del usuario en un curso.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_progress')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='user_progress')
    progress_percentage = models.FloatField(default=0.0)
    last_accessed_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'course')
        verbose_name = 'Progreso de Curso'
        verbose_name_plural = 'Progresos de Cursos'
    
    def __str__(self):
        return f"{self.user.username} - {self.course.title[:30]} - {self.progress_percentage:.1f}%"
        
    def save(self, *args, **kwargs):
        # Si el progreso llega al 100% y no tiene fecha de completado, asignarla
        if self.progress_percentage >= 100 and not self.completed_at:
            self.completed_at = timezone.now()
        # Si el progreso es menor al 100%, eliminar la fecha de completado
        elif self.progress_percentage < 100 and self.completed_at:
            self.completed_at = None
            
        super().save(*args, **kwargs)
