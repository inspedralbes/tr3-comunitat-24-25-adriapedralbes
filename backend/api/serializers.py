from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import (
    Subscriber, User, Category, Post, Comment, PostLike, CommentLike, 
    Course, Lesson, UserLessonProgress, UserCourseProgress
)

class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ['name', 'email']


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'avatar_url', 'bio', 'level', 'points', 
                'website', 'position', 'is_premium', 'created_at', 'date_joined', 'is_superuser', 'is_staff', 'is_admin']
        read_only_fields = ['id', 'created_at', 'date_joined', 'position', 'is_superuser', 'is_staff']
    
    def get_avatar_url(self, obj):
        if obj.avatar_url and hasattr(obj.avatar_url, 'url'):
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.avatar_url.url)
            return obj.avatar_url.url
        return None
        
    def get_is_admin(self, obj):
        return obj.is_superuser or obj.is_staff


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class UserShortSerializer(serializers.ModelSerializer):
    """
    Serializador simplificado de usuario para incluir en otros serializadores (posts, comentarios, etc.)
    """
    avatar_url = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'level', 'points', 'avatar_url', 'date_joined', 'is_superuser', 'is_staff', 'is_admin']
    
    def get_avatar_url(self, obj):
        if obj.avatar_url and hasattr(obj.avatar_url, 'url'):
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.avatar_url.url)
            return obj.avatar_url.url
        return None
        
    def get_is_admin(self, obj):
        return obj.is_superuser or obj.is_staff


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    author = UserShortSerializer(read_only=True)
    mentioned_user = UserShortSerializer(read_only=True)
    post = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'likes', 'created_at', 'updated_at', 'mentioned_user', 'post', 'replies', 'is_liked']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'likes', 'is_liked']
    
    def get_post(self, obj):
        return str(obj.post.id) if obj.post else None

    def get_replies(self, obj):
        # Limitar la profundidad de la serialización para evitar recursión infinita
        depth = getattr(self.context, 'depth', 0)
        
        # Si ya estamos en una profundidad excesiva, no serializar más niveles
        if depth > 5:  # Limitar a 5 niveles de anidamiento
            return []
            
        replies = Comment.objects.filter(parent=obj)
        
        # Pasar el contexto con la profundidad incrementada y el request original
        new_context = self.context.copy() if self.context else {}
        new_context['depth'] = depth + 1
        return CommentSerializer(replies, many=True, context=new_context).data
        
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return CommentLike.objects.filter(user=request.user, comment=obj).exists()
        return False


class PostSerializer(serializers.ModelSerializer):
    author = UserShortSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
        source='category'
    )

    class Meta:
        model = Post
        fields = ['id', 'author', 'category', 'title', 'content', 'image', 'likes', 'is_pinned', 
                'created_at', 'updated_at', 'comments_count', 'category_id', 'is_liked']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'likes', 'is_pinned', 'is_liked']

    def get_comments_count(self, obj):
        return obj.comments.count()
        
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PostLike.objects.filter(user=request.user, post=obj).exists()
        return False


class PostDetailSerializer(PostSerializer):
    comments = serializers.SerializerMethodField()

    class Meta(PostSerializer.Meta):
        fields = PostSerializer.Meta.fields + ['comments']

    def get_comments(self, obj):
        # Obtener solo comentarios de primer nivel (sin padres)
        comments = Comment.objects.filter(post=obj, parent=None)
        return CommentSerializer(comments, many=True).data


class PostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostLike
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class CommentLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentLike
        fields = ['id', 'user', 'comment', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'order', 'created_at', 'updated_at', 'course']
        read_only_fields = ['id', 'created_at', 'updated_at']


class LessonDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CourseSerializer(serializers.ModelSerializer):
    lessons_count = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    progress_percentage = serializers.IntegerField(required=False, default=0, write_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'thumbnail_url', 'progress_percentage', 'created_at', 'updated_at', 'lessons_count']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_lessons_count(self, obj):
        return obj.lessons.count()
        
    def get_thumbnail_url(self, obj):
        if obj.thumbnail and hasattr(obj.thumbnail, 'url'):
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None
        
    def validate(self, attrs):
        # Asegurarse de que los campos requeridos están presentes
        if 'title' not in attrs or not attrs['title']:
            raise serializers.ValidationError({"title": "El título es obligatorio."})
            
        # Asegurar que el progreso está entre 0 y 100
        if 'progress_percentage' in attrs and (attrs['progress_percentage'] < 0 or attrs['progress_percentage'] > 100):
            raise serializers.ValidationError({"progress_percentage": "El progreso debe estar entre 0 y 100."})
            
        return attrs


class CourseDetailSerializer(CourseSerializer):
    lessons = LessonDetailSerializer(many=True, read_only=True)
    
    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ['lessons']


# Nuevos serializadores para el progreso del usuario

class UserLessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLessonProgress
        fields = ['id', 'user', 'lesson', 'completed', 'completion_date', 'time_spent_seconds', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'completion_date']
        
    def validate(self, attrs):
        # Asegurarse de que el campo lesson está presente
        if 'lesson' not in attrs:
            raise serializers.ValidationError({"lesson": "El ID de la lección es obligatorio."})
            
        return attrs


class LessonProgressSerializer(serializers.ModelSerializer):
    """Serializador simplificado para usarse en UserCourseProgressSerializer"""
    lesson_id = serializers.CharField(source='lesson.id')
    lesson_title = serializers.CharField(source='lesson.title')
    
    class Meta:
        model = UserLessonProgress
        fields = ['lesson_id', 'lesson_title', 'completed', 'completion_date', 'time_spent_seconds']


class UserCourseProgressSerializer(serializers.ModelSerializer):
    completed_lessons = serializers.SerializerMethodField()
    course_title = serializers.CharField(source='course.title', read_only=True)
    total_lessons = serializers.SerializerMethodField()
    
    class Meta:
        model = UserCourseProgress
        fields = ['id', 'user', 'course', 'course_title', 'progress_percentage', 
                  'last_accessed_at', 'completed_at', 'created_at', 'updated_at',
                  'completed_lessons', 'total_lessons']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'completed_at']
    
    def get_completed_lessons(self, obj):
        """Obtener todas las lecciones completadas por el usuario en este curso"""
        lesson_progress = UserLessonProgress.objects.filter(
            user=obj.user,
            lesson__course=obj.course
        )
        return LessonProgressSerializer(lesson_progress, many=True).data
    
    def get_total_lessons(self, obj):
        """Obtener el número total de lecciones en el curso"""
        return Lesson.objects.filter(course=obj.course).count()
