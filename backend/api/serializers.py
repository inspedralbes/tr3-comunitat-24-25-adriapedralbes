from rest_framework import serializers
from django.contrib.auth import get_user_model

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
