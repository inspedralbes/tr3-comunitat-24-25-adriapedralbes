from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Subscriber, User, Category, Post, Comment, PostLike, CommentLike

class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ['name', 'email']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'avatar_url', 'bio', 'level', 'points', 
                'website', 'position', 'is_premium', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'position']


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
    class Meta:
        model = User
        fields = ['id', 'username', 'level', 'avatar_url']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    author = UserShortSerializer(read_only=True)
    mentioned_user = UserShortSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'likes', 'created_at', 'updated_at', 'mentioned_user', 'replies']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'likes']

    def get_replies(self, obj):
        replies = Comment.objects.filter(parent=obj)
        return CommentSerializer(replies, many=True).data


class PostSerializer(serializers.ModelSerializer):
    author = UserShortSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    comments_count = serializers.SerializerMethodField()
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        write_only=True,
        required=False,
        source='category'
    )

    class Meta:
        model = Post
        fields = ['id', 'author', 'category', 'title', 'content', 'image', 'likes', 'is_pinned', 
                'created_at', 'updated_at', 'comments_count', 'category_id']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'likes', 'is_pinned']

    def get_comments_count(self, obj):
        return obj.comments.count()


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
