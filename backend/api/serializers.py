from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Category, Post, Comment, UserLessonProgress, UserCourseProgress

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo de Usuario
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar_url', 'level', 'points', 'is_premium']
        read_only_fields = ['id', 'level', 'points', 'is_premium']

class UserShortSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para el modelo de Usuario
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar_url']

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Category
    """
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']

class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Comment
    """
    author = UserShortSerializer(read_only=True)
    author_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='author'
    )
    
    class Meta:
        model = Comment
        fields = ['id', 'author', 'author_id', 'post', 'parent', 'content', 
                  'likes', 'mentioned_user', 'created_at', 'updated_at']
        read_only_fields = ['id', 'likes', 'created_at', 'updated_at']

class PostSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Post
    """
    author = UserShortSerializer(read_only=True)
    author_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='author'
    )
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
        source='category'
    )
    comments_count = serializers.IntegerField(read_only=True, default=0)
    
    class Meta:
        model = Post
        fields = ['id', 'author', 'author_id', 'category', 'category_id', 'title',
                 'content', 'image', 'likes', 'is_pinned', 'created_at', 'updated_at',
                 'comments_count']
        read_only_fields = ['id', 'likes', 'is_pinned', 'created_at', 'updated_at']

class UserLessonProgressSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo UserLessonProgress
    """
    class Meta:
        model = UserLessonProgress
        fields = ['id', 'user', 'lesson', 'completed', 'completion_date', 
                 'time_spent_seconds', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class UserCourseProgressSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo UserCourseProgress
    """
    class Meta:
        model = UserCourseProgress
        fields = ['id', 'user', 'course', 'progress_percentage', 
                 'last_accessed_at', 'completed_at', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
