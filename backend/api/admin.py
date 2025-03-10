from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Subscriber, User, Category, Post, Comment, PostLike, CommentLike

@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'confirmed', 'created_at')
    list_filter = ('confirmed', 'created_at')
    search_fields = ('email', 'name')
    readonly_fields = ('confirmation_token', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'level', 'points', 'is_premium', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'is_premium', 'level')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-points',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Perfil de comunidad', {
            'fields': ('avatar_url', 'bio', 'level', 'points', 'website', 'position', 'is_premium', 'created_at', 'updated_at')
        }),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'color', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'category', 'content_preview', 'likes', 'is_pinned', 'created_at')
    list_filter = ('is_pinned', 'created_at', 'category')
    search_fields = ('content', 'author__username')
    date_hierarchy = 'created_at'
    list_select_related = ('author', 'category')
    
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Contenido'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'post_preview', 'content_preview', 'likes', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'author__username', 'post__content')
    date_hierarchy = 'created_at'
    list_select_related = ('author', 'post', 'parent', 'mentioned_user')
    
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Contenido'
    
    def post_preview(self, obj):
        return obj.post.content[:30] + "..." if len(obj.post.content) > 30 else obj.post.content
    post_preview.short_description = 'Post'


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'post_preview', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'post__content')
    date_hierarchy = 'created_at'
    list_select_related = ('user', 'post')
    
    def post_preview(self, obj):
        return obj.post.content[:30] + "..." if len(obj.post.content) > 30 else obj.post.content
    post_preview.short_description = 'Post'


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'comment_preview', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'comment__content')
    date_hierarchy = 'created_at'
    list_select_related = ('user', 'comment')
    
    def comment_preview(self, obj):
        return obj.comment.content[:30] + "..." if len(obj.comment.content) > 30 else obj.comment.content
    comment_preview.short_description = 'Comentario'
