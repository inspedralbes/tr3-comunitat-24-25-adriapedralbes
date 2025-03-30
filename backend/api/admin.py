from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse
from .models import Subscriber, User, Category, Post, Comment, PostLike, CommentLike, Event

# Admin personalizado para Subscriber
@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'confirmed', 'created_at', 'updated_at')
    list_filter = ('confirmed', 'created_at')
    search_fields = ('email', 'name')
    readonly_fields = ('confirmation_token', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Información del Suscriptor', {
            'fields': ('email', 'name', 'confirmed')
        }),
        ('Información Técnica', {
            'fields': ('confirmation_token', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )


# Importaciones para la acción de suscripción gratuita
from django.contrib import messages
from django.utils import timezone
from datetime import timedelta
from django import forms
from django.http import HttpResponseRedirect
from django.template.response import TemplateResponse
from django.urls import path

# Formulario para otorgar suscripción gratuita
class GrantFreeSubscriptionForm(forms.Form):
    duration_days = forms.IntegerField(
        min_value=1, 
        max_value=365, 
        initial=30,
        label='Duración (días)',
        help_text='Número de días que durará la suscripción gratuita'
    )
    reason = forms.CharField(
        max_length=255, 
        required=False,
        widget=forms.TextInput(attrs={'size': '50'}),
        label='Motivo',
        help_text='Motivo por el que se otorga la suscripción gratuita (opcional)'
    )

# Admin personalizado para User
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'get_avatar', 'email', 'first_name', 'last_name', 'level', 'points', 'is_premium', 'has_free_subscription', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'is_premium', 'has_free_subscription', 'level')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-points',)
    readonly_fields = ('created_at', 'updated_at', 'get_avatar_preview')
    actions = ['grant_free_subscription']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Perfil de Comunidad', {
            'fields': ('avatar_url', 'get_avatar_preview', 'bio', 'level', 'points', 'website', 'position', 'is_premium', 'created_at', 'updated_at')
        }),
        ('Suscripción Gratuita', {
            'fields': ('has_free_subscription', 'free_subscription_start_date', 'free_subscription_end_date', 'free_subscription_reason'),
            'classes': ('collapse',),
        }),
    )
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'user/grant-free-subscription/<path:object_id>/',
                self.admin_site.admin_view(self.grant_free_subscription_view),
                name='api_user_grant_free_subscription',
            ),
        ]
        return custom_urls + urls
    
    def grant_free_subscription(self, request, queryset):
        """Acción para otorgar suscripción gratuita a múltiples usuarios"""
        if queryset.count() == 1:
            # Si es solo un usuario, redirigir al formulario de suscripción
            user = queryset.first()
            # Construir la URL correctamente usando reverse
            from django.urls import reverse
            url = reverse('admin:api_user_grant_free_subscription', args=[user.pk])
            return HttpResponseRedirect(url)
        else:
            # Si son múltiples usuarios, otorgar suscripción con duración predeterminada
            for user in queryset:
                end_date = timezone.now() + timedelta(days=30)
                user.has_free_subscription = True
                user.free_subscription_start_date = timezone.now()
                user.free_subscription_end_date = end_date
                user.free_subscription_reason = "Otorgada por administrador"
                user.is_premium = True
                user.has_active_subscription = True
                user.subscription_status = "active"
                user.save()
            
            messages.success(request, f'Se ha otorgado una suscripción gratuita de 30 días a {queryset.count()} usuarios.')
    grant_free_subscription.short_description = "Otorgar suscripción gratuita"
    
    def grant_free_subscription_view(self, request, object_id, form_url=''):
        """Vista para otorgar suscripción gratuita a un usuario"""
        try:
            user = self.get_object(request, object_id)
        except (ValueError, self.model.DoesNotExist):
            # Si el usuario no existe o el ID no es válido
            messages.error(request, f"Usuario con ID {object_id} no encontrado")
            url = reverse('admin:api_user_changelist')
            return HttpResponseRedirect(url)
        
        if request.method != 'POST':
            form = GrantFreeSubscriptionForm()
        else:
            form = GrantFreeSubscriptionForm(request.POST)
            if form.is_valid():
                duration_days = form.cleaned_data['duration_days']
                reason = form.cleaned_data['reason']
                
                # Calcular fechas
                start_date = timezone.now()
                end_date = start_date + timedelta(days=duration_days)
                
                # Actualizar usuario
                user.has_free_subscription = True
                user.free_subscription_start_date = start_date
                user.free_subscription_end_date = end_date
                user.free_subscription_reason = reason or "Otorgada por administrador"
                user.is_premium = True
                user.has_active_subscription = True
                user.subscription_status = "active"
                user.save()
                
                self.message_user(request, f'Suscripción gratuita otorgada a {user.username} hasta {end_date.strftime("%d/%m/%Y")}', messages.SUCCESS)
                # Usar reverse para generar URL correcta
                return HttpResponseRedirect(reverse('admin:api_user_changelist'))
        
        context = self.admin_site.each_context(request)
        context['opts'] = self.model._meta
        context['form'] = form
        context['user'] = user
        context['title'] = f'Otorgar suscripción gratuita a {user.username}'
        context['app_label'] = 'api'
        context['model_name'] = 'user'
        
        return TemplateResponse(
            request,
            "admin/grant_free_subscription.html",
            context,
        )
    
    def get_avatar(self, obj):
        if obj.avatar_url:
            return format_html('<img src="{}" width="30" height="30" style="border-radius: 50%;"/>', obj.avatar_url.url)
        return format_html('<span style="color: #999;">Sin Imagen</span>')
    get_avatar.short_description = 'Avatar'
    
    def get_avatar_preview(self, obj):
        if obj.avatar_url:
            return format_html('<img src="{}" width="150" height="150" style="border-radius: 10px;"/>', obj.avatar_url.url)
        return format_html('<span style="color: #999;">Sin Imagen</span>')
    get_avatar_preview.short_description = 'Vista previa del avatar'


# Admin personalizado para Category
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'get_color_badge', 'get_posts_count', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    
    def get_color_badge(self, obj):
        return format_html('<span style="background-color: {}; padding: 5px 10px; border-radius: 4px; color: white;">{}</span>', 
                          obj.color if not obj.color.startswith('#') else obj.color, 
                          obj.color)
    get_color_badge.short_description = 'Color'
    
    def get_posts_count(self, obj):
        return obj.posts.count()
    get_posts_count.short_description = 'Número de posts'


# Admin personalizado para Post
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'category', 'content_preview', 'likes', 'comments_count', 'is_pinned', 'created_at')
    list_filter = ('is_pinned', 'created_at', 'category')
    search_fields = ('content', 'author__username')
    date_hierarchy = 'created_at'
    list_select_related = ('author', 'category')
    list_editable = ('is_pinned',)
    actions = ['pin_posts', 'unpin_posts']
    
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Contenido'
    
    def comments_count(self, obj):
        return obj.comments.count()
    comments_count.short_description = 'Comentarios'
    
    def pin_posts(self, request, queryset):
        queryset.update(is_pinned=True)
    pin_posts.short_description = "Fijar posts seleccionados"
    
    def unpin_posts(self, request, queryset):
        queryset.update(is_pinned=False)
    unpin_posts.short_description = "Desfijar posts seleccionados"


# Admin personalizado para Comment
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'post_link', 'content_preview', 'likes', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'author__username', 'post__content')
    date_hierarchy = 'created_at'
    list_select_related = ('author', 'post', 'parent', 'mentioned_user')
    
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Contenido'
    
    def post_link(self, obj):
        url = reverse('admin:api_post_change', args=[obj.post.id])
        return format_html('<a href="{}">{}</a>', url, obj.post.content[:30] + "..." if len(obj.post.content) > 30 else obj.post.content)
    post_link.short_description = 'Post'


# Admin personalizado para PostLike
@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'post_link', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'post__content')
    date_hierarchy = 'created_at'
    list_select_related = ('user', 'post')
    
    def post_link(self, obj):
        url = reverse('admin:api_post_change', args=[obj.post.id])
        return format_html('<a href="{}">{}</a>', url, obj.post.content[:30] + "..." if len(obj.post.content) > 30 else obj.post.content)
    post_link.short_description = 'Post'


# Admin personalizado para CommentLike
@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'comment_link', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'comment__content')
    date_hierarchy = 'created_at'
    list_select_related = ('user', 'comment')
    
    def comment_link(self, obj):
        url = reverse('admin:api_comment_change', args=[obj.comment.id])
        return format_html('<a href="{}">{}</a>', url, obj.comment.content[:30] + "..." if len(obj.comment.content) > 30 else obj.comment.content)
    comment_link.short_description = 'Comentario'


# Admin personalizado para Event
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'start_date', 'end_date', 'all_day')
    list_filter = ('type', 'all_day', 'start_date')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('title', 'type', 'description', 'meeting_url')
        }),
        ('Fecha y Hora', {
            'fields': ('start_date', 'end_date', 'all_day')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
