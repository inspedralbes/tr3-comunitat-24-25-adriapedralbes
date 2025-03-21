from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager
import uuid

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
