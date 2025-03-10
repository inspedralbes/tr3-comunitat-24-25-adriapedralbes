from django.contrib.admin.sites import AdminSite
from django.utils import timezone
from datetime import timedelta
from .models import User, Post, Comment, Category, Subscriber

class CustomAdminSite(AdminSite):
    site_header = 'DevAccelerator Admin'
    site_title = 'DevAccelerator Admin'
    index_title = 'Panel de administración'
    
    def index(self, request, extra_context=None):
        """Personaliza la página de inicio del admin con estadísticas."""
        
        # Obtén la fecha de hoy y de hace un mes
        today = timezone.now().date()
        month_ago = today - timedelta(days=30)
        
        # Prepara el contexto extra con estadísticas
        extra_stats = {
            'user_count': User.objects.count(),
            'premium_user_count': User.objects.filter(is_premium=True).count(),
            'post_count': Post.objects.count(),
            'pinned_post_count': Post.objects.filter(is_pinned=True).count(),
            'comment_count': Comment.objects.count(),
            'today_comment_count': Comment.objects.filter(created_at__date=today).count(),
            'category_count': Category.objects.count(),
            'subscriber_count': Subscriber.objects.count(),
            'confirmed_subscriber_count': Subscriber.objects.filter(confirmed=True).count(),
            'recent_posts': Post.objects.order_by('-created_at')[:5],
            'recent_users': User.objects.order_by('-created_at')[:5],
        }
        
        # Combina con cualquier contexto extra que se pueda haber pasado
        context = extra_context or {}
        context.update(extra_stats)
        
        # Llama al método index del padre con el contexto actualizado
        return super().index(request, context)

# Instancia personalizada del admin
custom_admin_site = CustomAdminSite(name='custom_admin')
